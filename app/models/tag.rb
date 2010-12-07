class Tag < ActiveRecord::Base

  scope :belongs_server, lambda {|server_id|
    where(:server_id => server_id)
  }

  self.include_root_in_json = false
  include Rails.application.routes.url_helpers

  def paths
    { :tag => tag_path(self) }
  end

end
