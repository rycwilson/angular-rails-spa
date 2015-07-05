module ApplicationHelper

  def validate_api_token
    @valid_api_token = ApiToken.find_by hex_value:params[:api_token]
  end

end
