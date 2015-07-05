class ChangeColumnName < ActiveRecord::Migration
  def change
    rename_column :simple_receipts, :store, :store_name
  end
end
