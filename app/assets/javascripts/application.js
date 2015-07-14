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

var app = angular.module("StoreApp", []);

// Required to POST/PUT/PATCH to Rails
app.config(["$httpProvider", function ($httpProvider) {
  $httpProvider.
    defaults.headers.common["X-CSRF-TOKEN"] = $("meta[name=csrf-token]").attr("content");
}]);
//

app.controller("MainCtrl", ['$scope', '$http', 'storeFactory', 'receiptFactory',
    function ($scope, $http, storeFactory, receiptFactory) {

  $scope.currentStore = null;
  $scope.status = null;
  // placeholder for a new receipt
  $scope.newReceipt = {};
  // start on the Account Info tab
  $scope.tab = 1;

  $scope.currentStore = getCurrentStore();

  function getCurrentStore() {
    storeFactory.getCurrentStore()
      .success(function(store) {
        $scope.currentStore = store;
      })
      .error(function(error) {
        $scope.status = 'Error loading data: ' + error.message;
    });
  }

  $scope.addReceipt = function(currentStore, $event) {
    // fill in the store name and id, and date
    $scope.newReceipt.store_name = $scope.currentStore.name;
    $scope.newReceipt.store_id = $scope.currentStore.id;
    // The line below (creating the date for $scope) results in
    // data-binding not working, i.e. view is not updated until
    // reloaded from the server.  Wtf?
    // -> No date for now.  Date will only appear upon re-load
    // from the server
    // $scope.newReceipt.created_at = new Date();
    console.log('New receipt: ', $scope.newReceipt);
    // add to $scope.currentStore's receipts
    currentStore.simple_receipts.push($scope.newReceipt);
    console.log('currentStore receipts: ', currentStore.simple_receipts);
    // POST receipt object
    receiptFactory.addReceipt($scope.newReceipt, $scope.currentStore.api_token.hex_value)
      .success(function(data, status) {
        console.log('addReceipt success: ', data, status);
      })
      .error(function(data, status) {
        console.log('addReceipt error: ', data, status);
      });
    // reset newReceipt
    $scope.newReceipt = {};
    // remove focus from button
    $event.target.submit.blur();
  };

  $scope.removeReceipt = function(receipt) {
    var receipts = $scope.currentStore.simple_receipts;
    if (confirm("Are you sure?")) {
      receipts.splice(receipts.indexOf(receipt), 1);
      receiptFactory.removeReceipt(receipt, $scope.currentStore.api_token.hex_value)
        .success(function(data, status) {
          console.log(data, status);
        });
    }
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

app.factory('storeFactory', ['$http', function ($http) {
  var storeFactory = {};
  storeFactory.getCurrentStore = function() {
    return $http.get("/account.json");
  };
  return storeFactory;
}]);

app.factory('receiptFactory', ['$http', function ($http) {
  var receiptFactory = {};
  receiptFactory.addReceipt = function(newReceipt, api_token) {
    var url = '/receipts.json?api_token=' + api_token;
    return $http.post(url, {receipt: newReceipt});
  };
  receiptFactory.removeReceipt = function(receipt, api_token) {
    var url = '/receipts.json?api_token=' +
              api_token + '&id=' + receipt.id;
    return $http.delete(url);
  };
  return receiptFactory;
}]);

