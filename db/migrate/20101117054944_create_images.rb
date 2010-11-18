class CreateImages < ActiveRecord::Migration
  def self.up
    create_table :images do |t|
      t.string :title
      t.string :os
      t.string :iqn
      t.text :comment

      t.timestamps
    end
  end

  def self.down
    drop_table :images
  end
end
