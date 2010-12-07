class FailoverTarget < ActiveRecord::Base

  scope :belongs_server, lambda {|server_id|
    where(:server_id => server_id)
  }

  def set_priority
    max = FailoverTarget.where(:server_id => self.server_id).maximum(:priority) || -1
    self.priority =  max + 1
  end

  def self.change_priority(server_id, src_id, dst_id)
    src_p = self.find(src_id).priority
    dst_p = self.find(dst_id).priority

    update_records = self.belongs_server(server_id)
    if src_p < dst_p
      update_records = update_records.where(:priority => src_p..dst_p).order('priority asc').all
    else
      update_records = update_records.where(:priority => dst_p..src_p).order('priority desc').all
    end

    (1...update_records.size).reverse_each do |i|
      update_records[i].priority = update_records[i - 1].priority
    end

    update_records.first.priority = dst_p

    update_records
  end

  self.include_root_in_json = false
  include Rails.application.routes.url_helpers

  def paths
    { :failover_target => failover_target_path(self) }
  end

end
