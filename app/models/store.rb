class Store < ActiveRecord::Base

  has_secure_password

  # validations
  validates :name, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, confirmation: true

  # associations
  has_one :api_token, dependent: :destroy
  # has_many :receipts

  # returns store or false
  def self.confirm(params)
    store = Store.find_by(email: params[:email])
    store.try(:authenticate, params[:password])
  end

end
