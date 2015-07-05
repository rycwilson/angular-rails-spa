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

  $scope.currentStore = null;
  // placeholder for a new receipt
  $scope.newReceipt = {};
  // start on the Account Info tab
  $scope.tab = 1;

  $http.get("/account.json").
    success(function (store) {
      $scope.currentStore = store;
      // Trying to prettyify JSON, not working.  Use a custom directive instead
      // $scope.receipts = JSON.stringify(store.simple_receipts, null, 2);
    });

  $scope.addReceipt = function(storeReceipts, $event) {
    // fill in the store name and id
    $scope.newReceipt.store_name = $scope.currentStore.name;
    $scope.newReceipt.store_id = $scope.currentStore.id;
    // add to $scope.currentStore's receipts
    storeReceipts.push($scope.newReceipt);
    // POST receipt object
    $http.post('/receipts.json', {receipt: $scope.newReceipt}).
      success(function(data, status) {
        // check status
        // add some flash messaging for success
      });
    // reset newReceipt
    $scope.newReceipt = {};
    $event.target.submit.blur();
  };

  // TODO: better to create a custom directive than manipulate DOM
  // from controller (but blur() is pretty simple; ok for now)
  $scope.resetToken = function($event) {
    $http.get('/account/token_reset.json').
      success(function (new_token) {
        $scope.currentStore.api_token.hex_value = new_token.hex_value;
        $event.target.blur();
      });
  };

  $scope.tabSelected = function(checkTab) {
    return $scope.tab === checkTab;
  };

  $scope.selectTab = function(setTab) {
    $scope.tab = setTab;
  };

}]);
