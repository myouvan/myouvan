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

    el = Equallogic.new(@logger)
    server.storage_iqn = el.clone_volume(server)
    server.save

    iscsi_login(server.physical_server, server.storage_iqn)

    device = "/dev/disk/by-path/ip-#{Settings.storage.server}:3260-iscsi-#{server.storage_iqn}-lun-0"
    domain_xml.sub!('%%device%%', device)

    virt_create_server(server, domain_xml)

    server.status = 'Running'
    server.save

    @logger.info "finish creating server #{server.name}"
  end

  def terminate_server(server)
    @logger.info "start terminating server #{server.name}"

    virsh_shutdown_server(server)
    iscsi_logout(server.physical_server, server.storage_iqn)

    el = Equallogic.new(@logger)
    el.delete_volume(server)

    server.status = 'Terminated'
    server.save

    @logger.info "finish terminating server #{server.name}"

    sleep 60
    server.destroy

    @logger.info "destroyed server record"
  end

  def migrate_server(server, new_physical_server)
    @logger.info "start migrating server #{server.name} to #{new_physical_server}"

    iscsi_login(new_physical_server, server.storage_iqn)
    virsh_migrate_server(server, new_physical_server)
    iscsi_logout(server.physical_server, server.storage_iqn)

    server.physical_server = new_physical_server
    server.status = 'Running'
    server.save

    @logger.info "finish migrated server #{server.name} to #{new_physical_server}"
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
      conn.run "/sbin/iscsiadm -m node -T #{iqn} --login"
    }

    @logger.debug "logged in iscsi #{iqn} on #{physical_server}"
  end

  def iscsi_logout(physical_server, iqn)
    iscsi_connect(physical_server) {|conn|
      conn.run "/sbin/iscsiadm -m node -T #{iqn} --logout"
      conn.run "/sbin/iscsiadm -m node -o delete -T #{iqn}"
    }

    @logger.debug "logged out iscsi #{iqn} on #{physical_server}"
  end

  #------------------------------
  #   virt
  #------------------------------


  def virt_create_server(server, domain_xml)
    conn = Libvirt::open("qemu+ssh://root@#{server.physical_server}/system")
    begin
      conn.define_domain_xml(domain_xml)
      domain = conn.lookup_domain_by_name(server.name)
      domain.create
    ensure
      conn.close
    end

    @logger.debug "virt created server #{server.name}"
  end

  def virsh_shutdown_server(server)
    conn = Libvirt::open("qemu+ssh://root@#{server.physical_server}/system")
    domain = conn.lookup_domain_by_name(server.name)
    domain.shutdown

    begin
      sleep 5 until domain.info.state == Libvirt::Domain::SHUTOFF
    rescue Libvirt::Error => err
      @logger.debug err.message
    end

    domain.undefine

    @logger.debug "shutdown server #{server.name}"
  end

  def virsh_migrate_server(server, new_physical_server)
    conn_src = Libvirt::open("qemu+ssh://root@#{server.physical_server}/system")
    domain = conn_src.lookup_domain_by_name(server.name)
    conn_dst = Libvirt::open("qemu+ssh://root@#{new_physical_server}/system")
    conn_dst.define_domain_xml(domain.xml_desc)
    domain.migrate(conn_dst, Libvirt::Domain::MIGRATE_LIVE)
    domain.undefine
    @logger.debug "migrated server #{server.name} to #{new_physical_server}"
  end

end
