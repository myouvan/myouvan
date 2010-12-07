class Tag < ActiveRecord::Base

  self.include_root_in_json = false
  include Rails.application.routes.url_helpers

  def paths
    { :tag => tag_path(self) }
  end

end
