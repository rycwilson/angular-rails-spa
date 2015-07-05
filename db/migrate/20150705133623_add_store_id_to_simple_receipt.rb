class AddStoreIdToSimpleReceipt < ActiveRecord::Migration
  def change
    add_column :simple_receipts, :store_id, :integer
  end
end
