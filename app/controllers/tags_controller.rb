class TagsController < ApplicationController

  def index
    server_id = params[:server_id]
    render_json :items, Tag.belongs_server(server_id), :methods => :paths
  end

  def combo_items
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
