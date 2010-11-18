# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20101118013748) do

  create_table "avatars", :force => true do |t|
    t.integer  "server_id"
    t.binary   "thumb"
    t.binary   "icon"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "images", :force => true do |t|
    t.string   "title"
    t.string   "os"
    t.string   "iqn"
    t.text     "comment"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "interfaces", :force => true do |t|
    t.integer  "server_id"
    t.integer  "number"
    t.string   "mac_address"
    t.string   "ip_address"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "servers", :force => true do |t|
    t.integer  "image_id"
    t.string   "name"
    t.string   "uuid"
    t.string   "title"
    t.string   "status"
    t.string   "zone"
    t.string   "physical_server"
    t.string   "pool"
    t.string   "virtualization"
    t.integer  "cpus"
    t.integer  "memory"
    t.string   "storage_iqn"
    t.text     "comment"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
