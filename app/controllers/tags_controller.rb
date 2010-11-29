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
    id = tag.id
    tag.destroy
    render :json => { :success => true, :item => { :id => id } }
  end

  def attributes_with_paths(tag)
    tag.attributes.merge({
      :paths => {
        :tag => url_for(tag)
      }
    })
  end

end
