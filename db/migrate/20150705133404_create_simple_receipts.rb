class CreateSimpleReceipts < ActiveRecord::Migration
  def change
    create_table :simple_receipts do |t|
      t.string :store
      t.string :item
      t.integer :amount
      t.string :transaction_num

      t.timestamps null: false
    end
  end
end
