module ApplicationHelper

  def combo_items(items)
    { :items => items.collect {|item| { :value => item } } }
  end

end
