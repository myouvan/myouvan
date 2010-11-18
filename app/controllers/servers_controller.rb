class ServersController < ApplicationController

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

end
