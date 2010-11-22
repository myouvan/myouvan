class TagsController < ApplicationController

  include ApplicationHelper

  def index
    tags = Tag.all.collect {|tag| tag.value }
    render :json => { :success => true }.merge(combo_items(tags))
  end

end
