class SessionsController < ApplicationController

  # GET /login
  def new
  end

  # POST /sessions
  def create
    if user_params[:email].present? && user_params[:password].present?
      # email and password entered, ok
      if Store.find_by(email:user_params[:email])
        # found the account, ok
        auth_store = Store.confirm user_params
        if auth_store
          # user authorized, ok
          login auth_store
          # NOTE account_path and NOT account_path(@store)
          # the latter doesn't work because there is no route
          # defined for account/:id

          redirect_to account_path, flash: { success: "Logged in successfully" }
        else
          # bad password
          flash.now[:danger] = "Invalid password"
          # display the login page again
          render :new
        end
      else
        # user not found
        flash[:warning] = "No account with that email address"
        # have them sign up
        redirect_to signup_path
      end
    else
      # incomplete login fields
      flash.now[:danger] = "Please enter your email and password"
      render :new
    end
  end

  # GET /logout
  def destroy
    logout
    redirect_to root_path, flash: { info: "Goodbye"}
  end

  private

  def user_params
    params.require(:user).permit(:email, :password)
  end

end
