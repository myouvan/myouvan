class TagsController < ApplicationController

  include ApplicationHelper

  def index
    tags = Tag.all.collect {|tag| tag.value }
    render :json => { :success => true }.merge(combo_items(tags))
  end

  def create
    tag = Tag.new(params[:tag])

    if tag.save
      render :json => { :success => true, :item => attributes_with_paths(tag) }
    else
      render :json => { :success => false }
    end
  end

  def destroy
    tag = Tag.find(params[:id])
    tag.destroy
    render :json => { :success => true }
  end

  def attributes_with_paths(image)
    image.attributes.merge({
      :paths => {
        :tag => url_for(tag)
      }
    })
  end

end
