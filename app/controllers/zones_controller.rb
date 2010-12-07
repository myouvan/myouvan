class ZonesController < ApplicationController

  include ApplicationHelper

  def index
    zones = Settings.physical_server.collect {|ps| ps['zone'] }
    render_combo_items_json zones
  end

end
