class TagsController < ApplicationController

  include ApplicationHelper

  def index
    tags = Tag.select('distinct value').all.collect {|tag| tag.value }
    render_combo_items_json tags
  end

  def create
    tag = Tag.new(params[:tag])

    if tag.save
      render_json :item, tag, :methods => :paths
    else
      render :json => { :success => false }
    end
  end

  def destroy
    tag = Tag.find(params[:id])
    tag.destroy
    render_json :item, tag
  end

end
