class PhysicalServersController < ApplicationController

  include ApplicationHelper

  def index
    zone = params[:zone]

    ps = Settings.physical_server.find {|ps| ps['zone'] == zone }
    physical_servers = ps['physical_servers']

    if params[:except]
      physical_servers = physical_servers.dup
      physical_servers.delete(params[:except])
    end

    render_combo_items_json physical_servers
  end

end
