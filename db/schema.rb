# encoding: UTF-8
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
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150705134414) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "api_tokens", force: :cascade do |t|
    t.string   "hex_value"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "store_id"
  end

  create_table "receipts", force: :cascade do |t|
    t.json     "customer_info"
    t.json     "items"
    t.decimal  "subtotal"
    t.decimal  "taxes"
    t.decimal  "total"
    t.string   "transaction_number"
    t.integer  "item_count"
    t.string   "payment_method"
    t.decimal  "tender_amount"
    t.decimal  "tip"
    t.decimal  "change_due"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.integer  "store_id"
  end

  create_table "simple_receipts", force: :cascade do |t|
    t.string   "store_name"
    t.string   "item"
    t.decimal  "amount"
    t.string   "transaction_num"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.integer  "store_id"
  end

  create_table "stores", force: :cascade do |t|
    t.string   "name"
    t.string   "email"
    t.string   "password_digest"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

end
