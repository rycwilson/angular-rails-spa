class SessionsController < ApplicationController

  #
  # GET /login
  #
  def new
  end

  #
  # POST /sessions
  #
  def create
    if params[:email].present? && params[:password].present?
      # email and password entered, ok
      if Store.find_by(email:params[:email])
        # found a user, ok
        @store = Store.confirm(email:params[:email], password:params[:password])
        if @store
          # user authorized, ok
          login @store
          # NOTE account_path and NOT account_path(@store)
          # the latter doesn't work because there is no route
          # defined for account/:id
          redirect_to account_path
        else
          # bad password
          # display the login page again
          render :new
        end
      else
        # user not found
        # have them sign up
        redirect_to signup_path
      end
    else
      # incomplete login fields
      render :new
    end
  end

  #
  # GET /logout
  #
  def destroy
    logout
    redirect_to root_path
  end

end
