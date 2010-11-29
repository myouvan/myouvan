class ServersController < ApplicationController

  include ApplicationHelper

  def index
    respond_to do |format|
      format.html
      format.json {
        render :json => {
          :success => true,
          :items => Server.all.collect {|server|
            tags = server.tags.collect {|tag| tag.value }
            attributes_with_paths(server).merge(:tags => tags)
          }
        }
      }
    end
  end

  def status
    servers = Server.all

    servers.each do |server|
      if %(Running Paused Terminated).include?(server.status)
        memcache = MemCache.new(Settings.memcached.server)
        state = memcache.get("#{Settings.memcached.key.state}:#{server.id}")
        if state != server.status
          server.status = state
          server.save
        end
      end
    end

    render :json => {
      :success => true,
      :items => servers.collect {|server|
        tags = server.tags.collect {|tag| tag.value }
        attributes_with_paths(server).merge(:tags => tags)
      }
    }
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

    render :json => { :success => true, :items => items }
  end

  def tags
    server = Server.find(params[:id])
    render :json => {
      :success => true,
      :items => server.tags.collect {|tag|
        tag.attributes.merge({ :paths => { :tag => url_for(tag) } })
      }
    }
  end

  def show
    server = Server.includes(:interfaces).find(params[:id])
    render :json => {
      :success => true,
      :item => {
        :server => attributes_with_paths(server),
        :interfaces => server.interfaces.collect {|interface| interface.attributes }
      }
    }
  end

  def zones
    zones = Settings.physical_server.collect {|ps| ps['zone'] }
    render :json => { :success => true }.merge(combo_items(zones))
  end

  def physical_servers
    ps = Settings.physical_server.find {|ps| ps['zone'] == params[:zone] }
    physical_servers = ps ? ps['physical_servers'] : Array.new
    physical_servers = physical_servers.dup
    physical_servers.delete(params[:except])
    render :json => { :success => true }.merge(combo_items(physical_servers))
  end

  def pools
    pools = Settings.pools_for_instance
    render :json => { :success => true }.merge(combo_items(pools))
  end

  def virtualizations
    virtualizations = ['KVM FullVirtualization']
    render :json => { :success => true }.merge(combo_items(virtualizations))
  end

  def create
    server = Server.new(params[:server])
    server.status = 'Starting'

    params[:interface].keys.sort.each do |i|
      server.interfaces << Interface.new(params[:interface][i])
    end

    server.avatar = Avatar.new(params[:avatar])

    JSON.parse(params[:tags]).each do |params_tag|
      server.tags << Tag.new(params_tag)
    end

    if server.save
      tags = server.tags.collect {|tag| tag.value }
      render :json => {
        :success => true,
        :item => attributes_with_paths(server).merge(:tags => tags)
      }
    else
      render :json => { :success => false, :errors => server.errors_for_ext }
      return
    end

    @server = server
    domain_xml = '' # because render_to_string returns ActionView::Buffer
    domain_xml << (render_to_string :action => 'domain', :layout => false)

    item = {
      :command => 'create_server',
      :server_id => server.id,
      :domain_xml => domain_xml
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def suspend
    server = Server.find(params[:id])
    server.status = 'Suspending'
    server.save

    render :json => {
      :success => true,
      :item => { :id => server.id, :status => server.status }
    }

    item = {
      :command => 'suspend_server',
      :server_id => server.id
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def resume
    server = Server.find(params[:id])
    server.status = 'Resuming'
    server.save

    render :json => {
      :success => true,
      :item => { :id => server.id, :status => server.status }
    }

    item = {
      :command => 'resume_server',
      :server_id => server.id
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def reboot
    server = Server.find(params[:id])
    server.status = 'Rebooting'
    server.save

    render :json => {
      :success => true,
      :item => { :id => server.id, :status => server.status }
    }

    item = {
      :command => 'reboot_server',
      :server_id => server.id
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def terminate
    server = Server.find(params[:id])
    server.status = 'Terminating'
    server.user_terminate = true
    server.save

    render :json => {
      :success => true,
      :item => { :id => server.id, :status => server.status }
    }

    item = {
      :command => 'terminate_server',
      :server_id => server.id
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def restart
    server = Server.find(params[:id])
    server.status = 'Restarting'
    server.save

    render :json => {
      :success => true,
      :item => { :id => server.id, :status => server.status }
    }

    item = {
      :command => 'restart_server',
      :server_id => server.id
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
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

    render :json => {
      :success => true,
      :item => { :id => server.id, :status => server.status }
    }

    item = {
      :command => 'migrate_server',
      :server_id => server.id,
      :new_physical_server => params[:server][:physical_server]
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def attributes_with_paths(server)
    avatar = Avatar.select(:id).where(:server_id => server.id).first
    server.attributes.merge({
      :paths => {
        :server => url_for(server),
        :monitor => monitor_server_path(server),
        :tags => tags_server_path(server),
        :suspend => suspend_server_path(server),
        :resume => resume_server_path(server),
        :reboot => reboot_server_path(server),
        :terminate => terminate_server_path(server),
        :restart => restart_server_path(server),
        :migrate => migrate_server_path(server),
        :avatarThumb => thumb_avatar_path(avatar.id),
        :avatarIcon => icon_avatar_path(avatar.id)
      }
    })
  end

end
