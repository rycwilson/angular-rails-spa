class ReceiptsController < ApplicationController

  before_action :validate_api_token

  # The actions in this file are for JSON response only
  respond_to :json

  #
  # GET /receipts.json
  #
  def show
    if @valid_api_token
      @receipts = @valid_api_token.store.simple_receipts
      respond_with @receipts
    else
      # unauthorized
      render json: { status:"error",
                       mesg:"Invalid API token" }, status: 401
    end
  end

  #
  # POST /receipts.json
  #
  def create
    # Shouldn't have to pass api_token if logged in
    # BUT...
    # Why does current_store come up nil when I POST asynchronously ???
    # So, unless I pass an API token, this doesn't work:
    # if logged_in? || @valid_api_token
    if @valid_api_token
      @simple_receipt = SimpleReceipt.create receipt_params
      # Make sure there's a simple_receipt_path in routes.rb
      # The responder will look for a receipt_path even though it's
      # not actually redirecting (as in the case of JSON response)
      respond_with @simple_receipt
      # equivalent to:
      # respond_to do |format|
      #   if @simple_receipt.save
      #     format.json { render json: @simple_receipt, location: simple_receipt_path }
      #   else
      #     format.json { render json: @simple_receipt.errors, status: :unprocessable_entity }
      #   end
      # end
    else
      # unauthorized
      render json: { status:"error",
                       mesg:"Invalid API token" }, status: 401
    end
  end

  #
  # DELETE /receipts.json
  #
  def destroy
    if @valid_api_token
      receipt = SimpleReceipt.find params[:id]
      receipt.destroy
      # Rails will send status 204 with empty response
      respond_with receipt
    else
      # unauthorized
      render json: { status:"error",
                       mesg:"Invalid API token" }, status: 401
    end
  end

  private

  def receipt_params
    # permit all receipt attributes
    # maybe not secure, but not typing everying out
    # TODO: a better way?
    params.require(:receipt).permit!
  end

  def validate_api_token
    @valid_api_token = ApiToken.find_by hex_value:params[:api_token]
  end

end
