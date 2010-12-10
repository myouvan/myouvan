class ServersController < ApplicationController

  skip_before_filter :verify_authenticity_token ,:only=>[:failover]

  def index
    respond_to do |format|
      format.html
      format.json {
        filtered_server = Server.filtered(params[:filter_value])

        if params[:ids].blank?
          servers = filtered_server.all
        else
          servers = filtered_server.find(JSON.parse(params[:ids]))
        end

        render_json :items, servers,
                    :methods => :paths, :include => :tags
      }
    end
  end

  def status
    servers = Server.filtered(params[:filter_value])

    render_json :items, servers,
                :only => [:id, :status, :physical_server,
                          :user_terminate, :allow_restart, :message]
  end

  def monitor
    memcache = MemCache.new(Settings.memcached.server)
    monitors = memcache.get("#{Settings.memcached.key.monitor}:#{params[:id]}") || Array.new
    cpus =  memcache.get("#{Settings.memcached.key.cpus}:#{params[:id]}") || 1

    monitors.reverse_each do |monitor|
      monitor[:time] = (monitor[:time] - monitors.first[:time]) * 1000000 + monitor[:usec]
    end

    items = monitors.each_cons(2).collect {|m1, m2|
      time_diff = m2[:time] - m1[:time]
      cpu_time_diff = m2[:cpu_time] - m1[:cpu_time]
      cpu_use = cpu_time_diff / time_diff / cpus / 10
      { :cpu_use => [cpu_use, 100].min }
    }

    if items.size < Settings.monitor_caches
      items.each_with_index do |item, i|
        item[:index] = i + Settings.monitor_caches - items.size
      end
      items = (0...(Settings.monitor_caches - items.size)).collect {|i|
        { :index => i, :cpu_use => 0 }
      } + items
    else
      items = items[-Settings.monitor_caches..-1]
      items.each_with_index do |item, i|
        item[:index] = i
      end
    end

    render_json :items, items
  end

  def show
    server = Server.includes(:interfaces).find(params[:id])
    render :json => {
      :success => true,
      :item => server.as_json(:methods => :paths).merge(
        :mac_address0 => server.interfaces[0].mac_address,
        :ip_address0 => server.interfaces[0].ip_address,
        :mac_address1 => server.interfaces[1].mac_address,
        :ip_address1 => server.interfaces[1].ip_address
      )
    }
  end

  def zones
    zones = Settings.physical_server.collect {|ps| ps['zone'] }
    render_combo_items_json zones
  end

  def physical_servers
    ps = Settings.physical_server.find {|ps| ps['zone'] == params[:zone] }
    physical_servers = ps ? ps['physical_servers'] : Array.new
    physical_servers = physical_servers.dup
    physical_servers.delete(params[:except])
    render_combo_items_json physical_servers
  end

  def pools
    pools = Settings.pools_for_instance
    render_combo_items_json pools
  end

  def virtualizations
    virtualizations = ['KVM FullVirtualization']
    render_combo_items_json virtualizations
  end

  def create
    server = create_record('Creating') or return

    @server = server
    domain_xml = '' # because render_to_string returns ActionView::Buffer
    domain_xml << (render_to_string :template => 'servers/domain.xml.builder', :layout => false)

    set_starling(:command => 'create_server',
                 :server_id => server.id,
                 :domain_xml => domain_xml)
  end

  def import
    create_record('Running')
  end

  def create_record(status)
    server = Server.new(params[:server])
    server.status = status

    params[:interface].keys.sort.each do |i|
      server.interfaces << Interface.new(params[:interface][i])
    end

    server.avatar = Avatar.new(params[:avatar])

    if params[:tags]
      params[:tags].each do |params_tag|
        server.tags << Tag.new(params_tag)
      end
    end

    if params[:failover_targets]
      params[:failover_targets].each do |params_failover_target|
        server.failover_targets << FailoverTarget.new(params_failover_target)
      end
    end

    if server.save
      tags = server.tags.collect {|tag| tag.value }
      render_json :item, server,
                  :methods => :paths, :include => :tags
      server
    else
      render :json => { :success => false, :errors => server.errors }
      nil
    end
  end

  def update
    valid = true

    server = Server.includes(:interfaces).find(params[:id])

    params[:server][:auto_restart] ||= false
    server.attributes = params[:server]
    valid = server.valid? && valid
    cpus_or_memory_changed = server.cpus_changed? || server.memory_changed?

    params[:interface].keys.sort.zip(server.interfaces) do |i, interface|
      interface.attributes = params[:interface][i]
      valid = interface.valid? && valid
    end
    ip_address_changed = server.interfaces.any? {|interface|
      interface.ip_address_changed?
    }

    unless valid
      render :json => { :success => false, :errors => server.errors_for_ext }
      return
    end

    avatar_changed = !params[:avatar][:thumb].blank?

    Server.transaction {
      server.status = 'Updating' if cpus_or_memory_changed or ip_address_changed

      server.save
      server.interfaces.each do |interface|
        interface.save
      end

      unless params[:avatar][:thumb].blank?
        server.avatar.attributes = params[:avatar]
        server.avatar.save
      end
    }

    render :json => {
      :success => true,
      :item => server.as_json(:methods => :paths).merge(
        :mac_address0 => server.interfaces[0].mac_address,
        :ip_address0 => server.interfaces[0].ip_address,
        :mac_address1 => server.interfaces[1].mac_address,
        :ip_address1 => server.interfaces[1].ip_address,
        :avatar_changed => avatar_changed                                           
      )
    }

    if cpus_or_memory_changed or ip_address_changed
      set_starling(:command => 'update_server',
                   :server_id => server.id,
                   :cpus_or_memory_changed => cpus_or_memory_changed,
                   :ip_address_changed => ip_address_changed)
    end
  end

  def suspend
    server = Server.find(params[:id])
    server.status = 'Suspending'
    server.save

    render_json :item, server, :only => [:id, :status]

    set_starling(:command => 'suspend_server',
                 :server_id => server.id)
  end

  def resume
    server = Server.find(params[:id])
    server.status = 'Resuming'
    server.save

    render_json :item, server, :only => [:id, :status]

    set_starling(:command => 'resume_server',
                 :server_id => server.id)
  end

  def reboot
    server = Server.find(params[:id])
    server.status = 'Rebooting'
    server.save

    render_json :item, server, :only => [:id, :status]

    set_starling(:command => 'reboot_server',
                 :server_id => server.id)
  end

  def shutdown
    server = Server.find(params[:id])
    server.status = 'Shutting down'
    server.user_terminate = true
    server.allow_restart = true
    server.save

    render_json :item, server,
                :only => [:id, :status, :user_terminate, :allow_restart]

    set_starling(:command => 'shutdown_server',
                 :server_id => server.id)
  end

  def restart
    server = Server.find(params[:id])
    server.status = 'Restarting'
    server.user_terminate = false
    server.allow_restart = false
    server.save

    render_json :item, server,
                :only => [:id, :status, :user_terminate, :allow_restart]

    set_starling(:command => 'restart_server',
                 :server_id => server.id)
  end

  def migrate
    errors = Hash.new
    if params[:server][:zone].blank?
      errors['server[zone]'] = "can't be blank"
    end
    if params[:server][:physical_server].blank?
      errors['server[physical_server]'] = "can't be blank"
    end
    unless errors.empty?
      render :json => { :success => false, :errors => errors }
      return
    end

    server = Server.find(params[:id])
    server.status = 'Migrating'
    server.save

    render_json :item, server, :only => [:id, :status]

    set_starling(:command => 'migrate_server',
                 :server_id => server.id,
                 :new_physical_server => params[:server][:physical_server])
  end

  def terminate
    server = Server.find(params[:id])
    server.status = 'Terminating'
    server.user_terminate = true
    server.save

    render_json :item, server,
                :only => [:id, :status, :user_terminate, :allow_restart]

    set_starling(:command => 'terminate_server',
                 :server_id => server.id)
  end

  def destroy
    server = Server.find(params[:id])
    server.destroy
    render_json :item, server
  end

  def failover
    physical_server = params[:physical_server]
    servers = Server.
      where(:physical_server => physical_server).
      includes(:failover_targets)

    servers.each do |server|
      unless server.failover_targets.empty?
        server.status = 'Failing over'
        server.save

        @server = server
        domain_xml = '' # because render_to_string returns ActionView::Buffer
        domain_xml << (render_to_string :template => 'servers/domain.xml.builder', :layout => false)

        set_starling(:command => 'failover_server',
                     :server_id => server.id,
                     :domain_xml => domain_xml)
      end
    end

    render :json => { :success => true }
  end

  def set_starling(item)
    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

end
