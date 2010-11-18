class CreateInterfaces < ActiveRecord::Migration
  def self.up
    create_table :interfaces do |t|
      t.integer :server_id
      t.integer :number
      t.string :mac_address
      t.string :ip_address

      t.timestamps
    end
  end

  def self.down
    drop_table :interfaces
  end
end
