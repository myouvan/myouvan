class TagsController < ApplicationController

  include ApplicationHelper

  def index
    tags = Tag.select('distinct value').all.collect {|tag| tag.value }
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
    attrs = tag.attributes
    tag.destroy
    render :json => { :success => true, :item => attrs }
  end

  def attributes_with_paths(tag)
    tag.attributes.merge({
      :paths => {
        :tag => tag_path(tag)
      }
    })
  end

end
