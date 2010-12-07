class ImagesController < ApplicationController

  include ApplicationHelper

  def index
    respond_to do |format|
      format.html
      format.json {
        images = Image.all.collect {|image|
          attributes_with_paths(image)
        }
        render :json => { :success => true, :items => images }
      }
    end
  end

  def show
    image = Image.find(params[:id])
    render :json => { :success => true, :item => image.attributes }
  end

  def oss
    oss = ['CentOS']
    render :json => { :success => true }.merge(combo_items(oss))
  end

  def iqns
    lines = `sudo /sbin/iscsiadm -m discovery -t sendtargets -p #{Settings.storage.server}`
    iqns = lines.split(/\r?\n/).collect {|line| line.split(/\s+/)[1] }
    render :json => { :success => true }.merge(combo_items(iqns))
  end

  def create
    image = Image.new(params[:image])
    if image.save
      render :json => { :success => true, :item => attributes_with_paths(image) }
    else
      render :json => { :success => false, :errors => image.errors_for_ext }
    end
  end

  def update
    image = Image.find(params[:id])
    image.attributes = params[:image]
    if image.save
      render :json => { :success => true, :item => image.attributes }
    else
      render :json => { :success => false, :errors => image.errors_for_ext }
    end
  end

  def destroy
    image = Image.find(params[:id])
    attrs = image.attributes
    image.delete
    render :json => { :success => true, :item => attrs }
  end

  def attributes_with_paths(image)
    image.attributes.merge({
      :paths => {
        :image => image_path(image)
      }
    })
  end

end
