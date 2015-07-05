Rails.application.routes.draw do

  root 'site#index'

  get '/signup', to: 'stores#new', as: 'signup'
  get '/login', to: 'sessions#new', as: 'login'
  post '/sessions', to: 'sessions#create'
  get '/logout', to: 'sessions#destroy', as: 'logout'

  post '/stores', to: 'stores#create'

  get '/account', to: 'stores#show', as: 'account'
  get '/account/token_reset', to: "stores#token_reset"

  get '/receipts', to: 'receipts#show', as: 'receipts'
  post '/receipts', to: 'receipts#create'
  delete '/receipts', to: 'receipts#destroy'

  # this route is necessary for using respond_with (despite there
  # being no redirect for JSON response)
  get '/simple_receipt/:id', to: 'receipts#show', as: 'simple_receipt'

  get '/passwd_reset', to: 'stores#passwd_reset', as: 'passwd_reset'

end
