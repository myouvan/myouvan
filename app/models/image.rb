class Image < ActiveRecord::Base

  validates :title, :presence => true
  validates :os, :presence => true
  validates :iqn, :presence => true

  def errors_for_ext
    Hash[errors.collect {|field, error| ["image[#{field}]", error] }]
  end

end
