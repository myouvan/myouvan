class FailoverTargetsController < ApplicationController

  def create
    failover_target = FailoverTarget.new(params[:failover_target])
    failover_target.priority = failover_target.set_priority

    if failover_target.save
      render :json => { :success => true, :item => attributes_with_paths(failover_target) }
    else
      render :json => { :success => false }
    end
  end

  def destroy
    failover_target = FailoverTarget.find(params[:id])
    attrs = failover_target.attributes
    failover_target.destroy
    render :json => { :success => true, :item => attrs }
  end

  def change_priority
    server_id = params[:server_id]
    src_id = params[:src_id]
    dst_id = params[:dst_id]
    update_records = FailoverTarget.change_priority(server_id, src_id, dst_id)

    FailoverTarget.transaction {
      update_records.each do |update_record|
        update_record.save
      end
    }

    render :json => {
      :success => true,
      :items => update_records.collect {|update_record|
        update_record.attributes
      }
    }
  end

  def attributes_with_paths(failover_target)
    failover_target.attributes.merge({
      :paths => {
        :failover_target => failover_target_path(failover_target)
      }
    })
  end

end
