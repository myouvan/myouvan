class ImagesController < ApplicationController

  include ApplicationHelper

  def index
    respond_to do |format|
      format.html
      format.json {
        render_json :images, Image.all, :methods => 'paths'
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
      render_json :image, image, :methods => 'paths'
    else
      render_json_failure :errors, image.errors_for_ext
    end
  end

  def update
    image = Image.find(params[:id])
    image.attributes = params[:image]
    if image.save
      render_json :image, image
    else
      render_json_failure :errors, image.errors_for_ext
    end
  end

  def destroy
    image = Image.find(params[:id])
    image.delete
    render_json :image, image
  end

end
