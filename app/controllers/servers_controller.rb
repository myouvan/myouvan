class ServersController < ApplicationController

  include ApplicationHelper

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

        render :json => {
          :success => true,
          :items => servers.collect {|server|
            tags = server.tags.collect {|tag| tag.value }
            attributes_with_paths(server).merge(:tags => tags)
          }
        }
      }
    end
  end

  def status
    servers = Server.filtered(params[:filter_value])

    render :json => {
      :success => true,
      :items => servers.collect {|server|
        server.attributes.reject {|key, value|
          not %w(id status physical_server user_terminate).include?(key)
        }
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
        tag.attributes.merge({ :paths => { :tag => tag_path(tag) } })
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

    unless params[:tags].blank?
      JSON.parse(params[:tags]).each do |params_tag|
        server.tags << Tag.new(params_tag)
      end
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
    domain_xml << (render_to_string :template => 'servers/domain.xml.builder', :layout => false)

    item = {
      :command => 'create_server',
      :server_id => server.id,
      :domain_xml => domain_xml
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def import
    server = Server.new(params[:server])
    server.status = 'Running'

    params[:interface].keys.sort.each do |i|
      server.interfaces << Interface.new(params[:interface][i])
    end

    server.avatar = Avatar.new(params[:avatar])

    unless params[:tags].blank?
      JSON.parse(params[:tags]).each do |params_tag|
        server.tags << Tag.new(params_tag)
      end
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

  def destroy
    server = Server.find(params[:id])
    attrs = server.attributes
    server.destroy
    render :json => { :success => true, :item => attrs }
  end

  def attributes_with_paths(server)
    avatar = Avatar.select(:id).where(:server_id => server.id).first
    server.attributes.merge({
      :paths => {
        :server => server_path(server),
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
