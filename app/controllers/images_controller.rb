class ImagesController < ApplicationController

  def index
    respond_to do |format|
      format.html
      format.json {
        images = Image.all.collect {
          image.attributes
        }
        render :json => { :success => true, :images => images }
      }
    end
  end

end
