require 'pty'
require 'my_expect'
require 'net/ssh'
require 'libvirt'

class PhysicalServer

  def initialize(logger)
    @logger = logger
  end

  #------------------------------
  #   operation
  #------------------------------

  def create_server(server, domain_xml)
    @logger.info "start creating server #{server.name}"

    begin
      el = Equallogic.new(@logger)
      server.storage_iqn = el.clone_volume(server)
      server.save
    rescue EquallogicError => err
      @logger.error "#{err.class}: #{err.message}"
      @logger.error "error creating server #{server.name}"
      server.status = 'Error'
      server.message = "Storage error: #{err.message}\nServer was not created.\nDestroy this meta data."
      server.save
      return
    end

    begin
      iscsi_login(server.physical_server, server.storage_iqn)
    rescue Errno::ECONNREFUSED => err
      @logger.error "#{err.class}: #{err.message}"
      @logger.error "error creating server #{server.name}"
      el.delete_volume(server)
      server.status = 'Error'
      server.message = "Server error: #{err.message}\nServer was not created.\nDestroy this meta data."
      return
    end

    domain_xml.sub!('%%storage_iqn%%', server.storage_iqn)
    virt_create_server(server, domain_xml)

    virtual_server = Centos.new(@logger)
    virtual_server.set_network(server)
    virt_reboot_server(server)
    virtual_server.wait_login_prompt(server)

    server.status = 'Running'
    server.save

    @logger.info "finished creating server #{server.name}"
  end

  def update_server(server, cpus_or_memory_changed, ip_address_changed)
    @logger.info "start updating server #{server.name}"

    if cpus_or_memory_changed
      virt_update_server(server) 
      virtual_server = Centos.new(@logger)
      virtual_server.wait_login_prompt(server)
    end

    if ip_address_changed
      virtual_server ||= Centos.new(@logger)
      virtual_server.set_ip_addresses(server)
    end

    server.status = 'Running'
    server.save

    @logger.info "finished updating server #{server.name}"
  end

  def suspend_server(server)
    @logger.info "start suspending server #{server.name}"

    virt_suspend_server(server)

    server.status = 'Paused'
    server.save

    @logger.info "finished suspending server #{server.name}"
  end

  def resume_server(server)
    @logger.info "start resuming server #{server.name}"

    virt_resume_server(server)

    server.status = 'Running'
    server.save

    @logger.info "finished resuming server #{server.name}"
  end

  def reboot_server(server)
    @logger.info "start rebooting server #{server.name}"

    virt_reboot_server(server)

    virtual_server = Centos.new(@logger)
    virtual_server.wait_login_prompt(server)

    server.status = 'Running'
    server.save

    @logger.info "finished rebooting server #{server.name}"
  end

  def shutdown_server(server)
    @logger.info "start shutting server down #{server.name}"

    virt_shutdown_server(server, false)

    server.status = 'Shut down'
    server.save

    @logger.info "finished terminating server #{server.name}"
  end

  def restart_server(server)
    @logger.info "start restarting server #{server.name}"

    virt_restart_server(server)

    virtual_server = Centos.new(@logger)
    virtual_server.wait_login_prompt(server)

    server.status = 'Running'
    server.save

    @logger.info "finished restarting server #{server.name}"
  end

  def migrate_server(server, new_physical_server)
    @logger.info "start migrating server #{server.name} to #{new_physical_server}"

    iscsi_login(new_physical_server, server.storage_iqn)

    begin
      virt_migrate_server(server, new_physical_server)
    rescue Libvirt::Error
      virt_rollback_migrate_server(server, new_physical_server)
      iscsi_logout(new_physical_server, server.storage_iqn)
      raise
    end

    iscsi_logout(server.physical_server, server.storage_iqn)

    server.physical_server = new_physical_server
    server.status = 'Running'
    server.save

    @logger.info "finished migrated server #{server.name} to #{new_physical_server}"
  end

  def terminate_server(server)
    @logger.info "start terminating server #{server.name}"

    virt_shutdown_server(server, true)
    iscsi_logout(server.physical_server, server.storage_iqn)

    el = Equallogic.new(@logger)
    el.delete_volume(server)

    server.status = 'Terminated'
    server.save

    @logger.info "finished terminating server #{server.name}"

    sleep 60
    server.destroy

    @logger.info "destroyed server record"
  end

  def failover_server(server, domain_xml)
    @logger.info "start failing over server #{server.name}"

    begin
      failover_target = server.failover_targets.shift
      server.physical_server = failover_target.physical_server
      server.save
      failover_target.destroy

      iscsi_login(server.physical_server, server.storage_iqn)
    rescue Errno::ECONNREFUSED => err
      @logger.error "#{err.class}: #{err.message}"

      if server.failover_targets.empty?
        server.status = 'Error'
        server.message = 'cannot find available failover target'
        return
      end

      retry
    end

    virt_create_server(server, domain_xml)
    virtual_server = Centos.new(@logger)
    virtual_server.wait_login_prompt(server)

    server.status = 'Running'
    server.save

    @logger.info "finished failing over server #{server.name}"
  end

  
  #------------------------------
  #   iscsi
  #------------------------------

  def iscsi_connect(physical_server)
    Net::SSH.start(physical_server, 'root') {|conn|
      def conn.run(cmd)
        stdout, stderr = '', ''
        exec!("#{cmd}") do |ch, stream, data|
          case stream
          when :stdout
            stdout << data
          when :stderr
            stderr << data
          end
        end
        raise RuntimeError, stderr unless stderr.empty?
        stdout.split(/\r\n/)
      end
      yield conn
    }
  end

  def iscsi_login(physical_server, iqn)
    iscsi_connect(physical_server) {|conn|
      conn.run "/sbin/iscsiadm -m node -o new -p #{Settings.storage.server} -T #{iqn}"
      begin
        conn.run "/sbin/iscsiadm -m node -T #{iqn} --login"
      rescue RuntimeError => err
        raise unless err.message =~ /15 - already exists/
      end
    }

    @logger.info "logged in iscsi #{iqn} on #{physical_server}"
  end

  def iscsi_logout(physical_server, iqn)
    iscsi_connect(physical_server) {|conn|
      conn.run "/sbin/iscsiadm -m node -T #{iqn} --logout"
      conn.run "/sbin/iscsiadm -m node -o delete -T #{iqn}"
    }

    @logger.info "logged out iscsi #{iqn} on #{physical_server}"
  end


  #------------------------------
  #   virt base
  #------------------------------

  def _virt_get_conn(physical_server)
    Libvirt::open("qemu+ssh://root@#{physical_server}/system")
  end

  def _virt_get_domain(name, physical_server)
    conn = _virt_get_conn(physical_server)
    conn.lookup_domain_by_name(name)
  end

  def _virt_shutdown(domain)
    domain.shutdown

    begin
      sleep 5 until domain.info.state == Libvirt::Domain::SHUTOFF
    rescue Libvirt::Error => err
      @logger.debug err.message
    end
  end


  #------------------------------
  #   virt methods
  #------------------------------

  def virt_create_server(server, domain_xml)
    conn = _virt_get_conn(server.physical_server)
    conn.define_domain_xml(domain_xml)
    domain = conn.lookup_domain_by_name(server.name)
    domain.create

    @logger.info "virt created server #{server.name}"
  end

  def virt_update_server(server)
    domain = _virt_get_domain(server.name, server.physical_server)
    _virt_shutdown(domain)

    domain.vcpus = server.cpus

    info = domain.info
    if info.memory > server.memory * 1024
      domain.memory = server.memory * 1024
      domain.max_memory = server.memory * 1024
    else
      domain.max_memory = server.memory * 1024
      domain.memory = server.memory * 1024
    end

    domain.create

    @logger.info "virt updated server #{server.name}"
  end

  def virt_suspend_server(server)
    domain = _virt_get_domain(server.name, server.physical_server)
    domain.suspend
    @logger.info "virt suspended server #{server.name}"
  end

  def virt_resume_server(server)
    domain = _virt_get_domain(server.name, server.physical_server)
    domain.resume
    @logger.info "virt resumed server #{server.name}"
  end

  def virt_reboot_server(server)
    domain = _virt_get_domain(server.name, server.physical_server)
    _virt_shutdown(domain)
    domain.create
    @logger.info "virt rebooted server #{server.name}"
  end

  def virt_shutdown_server(server, undefine)
    domain = _virt_get_domain(server.name, server.physical_server)
    _virt_shutdown(domain)
    domain.undefine if undefine
    @logger.info "virt shutdown server #{server.name}"
  end

  def virt_restart_server(server)
    domain = _virt_get_domain(server.name, server.physical_server)
    domain.create
    @logger.info "virt restart server #{server.name}"
  end

  def virt_migrate_server(server, new_physical_server)
    domain = _virt_get_domain(server.name, server.physical_server)
    conn_dst = _virt_get_conn(new_physical_server)
    conn_dst.define_domain_xml(domain.xml_desc)
    domain.migrate(conn_dst, Libvirt::Domain::MIGRATE_LIVE)
    domain.undefine
    @logger.info "virt migrated server #{server.name} to #{new_physical_server}"
  end

  def virt_rollback_migrate_server(server, new_physical_server)
    begin
      domain_dst = _virt_get_domain(server.name, new_physical_server)
      domain_dst.destroy unless domain_dst.info.state == Libvirt::Domain::SHUTOFF
      domain_dst.undefine
    rescue Libvirt::RetrieveError
    end

    domain_src = _virt_get_domain(server.name, server.physical_server)
    domain_src.create if domain_src.info.state == Libvirt::Domain::SHUTOFF
  end

end
