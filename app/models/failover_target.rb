class FailoverTarget < ActiveRecord::Base

  scope :belongs_server, lambda {|server_id|
    where(:server_id => server_id)
  }

  def set_priority
    max = FailoverTarget.where(:server_id => self.server_id).maximum(:priority) || -1
    self.priority =  max + 1
  end

  def self.change_priority(server_id, src_id, dst_id)
    src = self.find(src_id)
    dst = self.find(dst_id)

    dst_priority = dst.priority

    update_records = self.belongs_server(server_id)
    if src.priority < dst.priority
      update_records = update_records.where(:priority => src.priority..dst.priority).order(:priority).all
    else
      update_records = update_records.where(:priority => dst.priority..src.priority).order('priority desc').all
    end

    (1...update_records.size).reverse_each do |i|
      update_records[i].priority = update_records[i - 1].priority
    end

    update_records.first.priority = dst_priority

    update_records
  end

end
