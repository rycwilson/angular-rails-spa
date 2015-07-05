class FixColumnType < ActiveRecord::Migration
  def change
    change_column :simple_receipts, :amount, :decimal
  end
end
