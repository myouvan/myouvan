module ApplicationHelper

  def render_json(name, item, opts = {})
    render :json => { :success => true, name => item.as_json(opts) }
  end

  def render_failure_json(name, item, opts = {})
    render :json => { :success => false, name => item.as_json(opts) }
  end

  def render_combo_items_json(items)
    render_json :items, items.collect {|item| { :value => item } }
  end

end
