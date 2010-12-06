class FailoverTarget < ActiveRecord::Base

  def set_priority
    max = FailoverTarget.where(:server_id => self.server_id).maximum(:priority) || -1
    self.priority =  max + 1
  end

end
