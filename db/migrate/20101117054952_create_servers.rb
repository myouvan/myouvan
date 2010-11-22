class CreateServers < ActiveRecord::Migration
  def self.up
    create_table :servers do |t|
      t.integer :image_id

      t.string :name
      t.string :uuid
      t.string :title
      t.string :status

      t.string :zone
      t.string :physical_server
      t.string :pool

      t.string :virtualization

      t.integer :cpus
      t.integer :memory

      t.string :storage_iqn

      t.text :comment

      t.boolean :auto_restart
      t.boolean :user_terminate

      t.timestamps
    end
  end

  def self.down
    drop_table :servers
  end
end
