module ApplicationHelper

  def render_json(root, item, opts = {})
    render({ :json => { :success => true, root => item } }.merge(opts))
  end

  def render_json_failure(root, item, opts = {})
    render({ :json => { :success => false, root => item } }.merge(opts))
  end

  def render_combo_items_json(items)
    render_json :items, items.collect {|item| { :value => item } }
  end

end
