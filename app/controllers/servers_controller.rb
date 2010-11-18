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
      :interfaces => server.interfaces
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
