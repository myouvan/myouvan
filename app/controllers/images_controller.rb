class ImagesController < ApplicationController

  def index
    respond_to do |format|
      format.html
      format.json {
        images = Image.all.collect {|image|
          image.attributes
        }
        render :json => { :success => true, :images => images }
      }
    end
  end

  def new
    comboItems = { :os => ['CentOS'], :iqn => get_iqns }
    render :json => { :success => true, :comboItems => comboItems }
  end

  def get_iqns
    lines = `sudo /sbin/iscsiadm -m discovery -t sendtargets -p #{Settings.storage.server}`
    lines.split(/\r\n/).collect {|line| line.split(/\s+/)[1] }
  end

  def create
    image = Image.new(params[:image])
    if image.save
      render :json => { :success => true, :image => image.attributes }
    else
      render :json => { :success => false, :errors => image.errors_for_ext }
    end
  end

end
