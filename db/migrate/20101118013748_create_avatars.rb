class CreateAvatars < ActiveRecord::Migration
  def self.up
    create_table :avatars do |t|
      t.integer :server_id
      t.binary :thumb
      t.binary :icon

      t.timestamps
    end
  end

  def self.down
    drop_table :avatars
  end
end
