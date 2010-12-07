class Image < ActiveRecord::Base

  validates :title, :presence => true
  validates :os, :presence => true
  validates :iqn, :presence => true

  def errors_for_ext
    h = errors.collect {|field, error|
      ["image[#{field}]", error]
    }
    Hash[h]
  end

  include Rails.application.routes.url_helpers
  self.include_root_in_json = false

  def paths
    {
      :image => image_path(self)
    }
  end

end
