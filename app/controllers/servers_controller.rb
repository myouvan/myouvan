class ServersController < ApplicationController

  include ApplicationHelper

  def index
    respond_to do |format|
      format.html
      format.json {
        servers = Server.all.collect {|server|
          server.attributes
        }
        render :json => { :success => true, :servers => servers }
      }
    end
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

end
