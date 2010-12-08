class ImagesController < ApplicationController

  def index
    respond_to do |format|
      format.html
      format.json {
        render_json :items, Image.all, :methods => :paths
      }
    end
  end

  def oss
    oss = ['CentOS']
    render_combo_items_json oss
  end

  def iqns
    lines = `sudo /sbin/iscsiadm -m discovery -t sendtargets -p #{Settings.storage.server}`
    iqns = lines.split(/\r?\n/).collect {|line| line.split(/\s+/)[1] }
    render_combo_items_json iqns
  end

  def create
    image = Image.new(params[:image])
    if image.save
      render_json :item, image, :methods => :paths
    else
      render :json => { :success => false, :errors => image.errors_for_ext }
    end
  end

  def update
    image = Image.find(params[:id])
    image.attributes = params[:image]
    if image.save
      render_json :item, image
    else
      render :json => { :success => false, :errors => image.errors_for_ext }
    end
  end

  def destroy
    image = Image.find(params[:id])
    image.delete
    render_json :item, image
  end

end
