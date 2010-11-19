class ServersController < ApplicationController

  include ApplicationHelper

  def index
    respond_to do |format|
      format.html
      format.json {
        servers = Server.all.collect {|server|
          attributes_with_paths(server)
        }
        render :json => { :success => true, :items => servers }
      }
    end
  end

  def show
    server = Server.includes(:interfaces).find(params[:id])
    render :json => {
      :success => true,
      :server => attributes_with_paths(server),
      :interfaces => server.interfaces.collect {|interface| interface.attributes }
    }
  end

  def zones
    zones = ['Defaule']
    render :json => { :success => true }.merge(combo_items(zones))
  end

  def physical_servers
    physical_servers = Settings.physical_servers
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

    if server.save
      render :json => { :success => true, :data => attributes_with_paths(server) }
    else
      render :json => { :success => false, :errors => server.errors_for_ext }
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

  def terminate
    server = Server.find(params[:id])
    server.status = 'Terminating'
    server.save

    render :json => { :success => true }

    item = {
      :command => 'terminate_server',
      :server_id => server.id
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def migrate
    new_physical_server = params[:physical_server]
    if new_physical_server.blank?
      render :json => { :success => false, :errors => { :physical_server => "can't be blank" } }
      return
    end

    server = Server.find(params[:id])
    server.status = 'Migrating'
    server.save

    render :json => { :success => true }

    item = {
      :command => 'migrate_server',
      :server_id => server.id,
      :new_physical_server => new_physical_server
    }

    starling = Starling.new(Settings.starling.server)
    starling.set(Settings.starling.queue, item)
  end

  def attributes_with_paths(server)
    avatar = Avatar.select(:id).where(:server_id => server.id).first
    server.attributes.merge({
      :paths => {
        :server => url_for(server),
        :reboot => reboot_server_path(server),
        :terminate => terminate_server_path(server),
        :migrate => migrate_server_path(server),
        :avatarThumb => thumb_avatar_path(avatar.id),
        :avatarIcon => icon_avatar_path(avatar.id)
      }
    })
  end

end
