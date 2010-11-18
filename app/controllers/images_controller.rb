class ImagesController < ApplicationController

  def index
    respond_to do |format|
      format.html
      format.json {
        images = Image.all.collect {|image|
          attributes_with_paths(image)
        }
        render :json => { :success => true, :images => images }
      }
    end
  end

  def new
    comboItems = { :os => ['CentOS'], :iqn => get_iqns }
    render :json => { :success => true, :comboItems => comboItems }
  end

  def create
    image = Image.new(params[:image])
    if image.save
      render :json => { :success => true, :image => attributes_with_paths(image) }
    else
      render :json => { :success => false, :errors => image.errors_for_ext }
    end
  end

  def edit
    image = Image.find(params[:id])
    comboItems = { :os => ['CentOS'], :iqn => get_iqns }
    render :json => { :success => true, :comboItems => comboItems, :values => image.attributes }
  end

  def update
    image = Image.find(params[:id])
    image.attributes = params[:image]
    if image.save
      render :json => { :success => true, :data => image.attributes }
    else
      render :json => { :success => false, :errors => image.errors_for_ext }
    end
  end

  def destroy
    image = Image.find(params[:id])
    image.delete
    render :json => { :success => true }
  end

  def attributes_with_paths(image)
    h = image.attributes
    h[:paths] = {
      :image => url_for(image),
      :edit => edit_image_path(image)
    }
    h
  end

  def get_iqns
    lines = `sudo /sbin/iscsiadm -m discovery -t sendtargets -p #{Settings.storage.server}`
    lines.split(/\r\n/).collect {|line| line.split(/\s+/)[1] }
  end

end
