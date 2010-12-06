class CreateFailoverTargets < ActiveRecord::Migration
  def self.up
    create_table :failover_targets do |t|
      t.integer :server_id
      t.integer :priority
      t.string :physical_server

      t.timestamps
    end
  end

  def self.down
    drop_table :failover_targets
  end
end
