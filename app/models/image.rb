class Image < ActiveRecord::Base

  validates :title, :presence => true
  validates :os, :presence => true
  validates :iqn, :presence => true

  include Rails.application.routes.url_helpers
  self.include_root_in_json = false

  def paths
    {
      :image => image_path(self)
    }
  end

end
