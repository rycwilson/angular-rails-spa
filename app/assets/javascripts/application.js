// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require bootstrap-sprockets
//= require jquery_ujs
//= require turbolinks
//= require angular/angular
//= require_tree .

console.log('js loaded');

var app = angular.module("StoreApp", []);

// Required to POST/PUT/PATCH to Rails
app.config(["$httpProvider", function ($httpProvider) {
  $httpProvider.
    defaults.headers.common["X-CSRF"] = $("meta[name=csrf-token]").attr("content");
}]);
//

app.controller("MainCtrl", ['$scope', '$http', function ($scope, $http) {

  $scope.current_store = null;

  // TODO: better to create a custom directive than manipulate DOM
  // from controller (but blur() is pretty simple)
  $scope.resetToken = function($event) {
    $http.get('account/token_reset.json').
      success(function (new_token) {
        $scope.current_store.api_token.hex_value = new_token.hex_value;
        $event.target.blur();
      });
  };

  $http.get("/account.json").
    success(function (store) {
      $scope.current_store = store;
    });

}]);
