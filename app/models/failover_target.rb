class FailoverTarget < ActiveRecord::Base

  def set_priority
    self.priority = FailoverTarget.where(:server_id => self.server_id).maximum(:priority) + 1
  end

end
