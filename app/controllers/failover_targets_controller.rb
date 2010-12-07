class FailoverTargetsController < ApplicationController

  include ApplicationHelper

  def index
    server_id = params[:server_id]
    render_json :items, FailoverTarget.belongs_server(server_id), :methods => :paths
  end

  def create
    failover_target = FailoverTarget.new(params[:failover_target])
    failover_target.priority = failover_target.set_priority

    if failover_target.save
      render_json :item, failover_target, :methods => :paths
    else
      render :json => { :success => false }
    end
  end

  def destroy
    failover_target = FailoverTarget.find(params[:id])
    failover_target.destroy
    render_json :item, failover_target
  end

  def change_priority
    server_id = params[:server_id]
    src_id = params[:src_id]
    dst_id = params[:dst_id]

    update_records = nil
    FailoverTarget.transaction {
      update_records = FailoverTarget.change_priority(server_id, src_id, dst_id)

      update_records.each do |update_record|
        update_record.save
      end
    }

    render_json :items, update_records
  end

end
