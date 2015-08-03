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

app.controller("MainCtrl", ['$scope', '$http', '$filter', 'storeFactory', 'receiptFactory',
    function ($scope, $http, $filter, storeFactory, receiptFactory) {

  $scope.currentStore = null;
  $scope.status = null;
  // placeholder for a new receipt
  $scope.newReceipt = {};
  // placeholder for an edited receipt
  $scope.editReceipt = {};
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
    // POST receipt object
    receiptFactory.addReceipt($scope.newReceipt, $scope.currentStore.api_token.hex_value)
      .success(function(data, status) {
        console.log('addReceipt success: ', data, status);
        // add to $scope.currentStore's receipts, latest first
        currentStore.simple_receipts.unshift(data);
      })
      .error(function(data, status) {
        console.log('addReceipt error: ', data, status);
      });
    // reset newReceipt
    $scope.newReceipt = {};
    // remove focus from button
    $event.target.submit.blur();
  };

  $scope.updateReceipt = function() {
    var receipts = $scope.currentStore.simple_receipts;
    // find and update the edited receipt
    var index = -1;
    for (var i = 0; i < receipts.length; i++) {
      if (receipts[i].id === $scope.editReceipt.id) {
        // update $scope
        receipts[i].item = $scope.editReceipt.item;
        receipts[i].amount = $scope.editReceipt.amount;
        receipts[i].transaction_num = $scope.editReceipt.transaction_num;
      }
    }
    // PUT receipt
    receiptFactory.updateReceipt($scope.editReceipt, $scope.currentStore.api_token.hex_value)
      .success(function(data, status) {
        console.log('updateReceipt success: ', data, status);
      })
      .error(function(data, status) {
        console.log(('updateReceipt error: ', data, status));
      });
    // close the modal
    $('#edit').modal('hide');
    // reset editReceipt
    $scope.editReceipt = {};
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

  $scope.openEditModal = function(receipt) {
    $scope.editReceipt.id = receipt.id;
    $scope.editReceipt.item = receipt.item;
    $scope.editReceipt.amount = receipt.amount;
    $scope.editReceipt.transaction_num = receipt.transaction_num;
  };

  $scope.tabSelected = function(checkTab) {
    return $scope.tab === checkTab;
  };

  $scope.selectTab = function(setTab) {
    $scope.tab = setTab;
  };

}]);  // MainCtrl

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
  receiptFactory.updateReceipt = function(editReceipt, api_token) {
    var url = '/receipts.json?api_token=' +
              api_token + '&id=' + editReceipt.id;
    return $http.put(url, {receipt: editReceipt});
  };
  receiptFactory.removeReceipt = function(receipt, api_token) {
    var url = '/receipts.json?api_token=' +
              api_token + '&id=' + receipt.id;
    return $http.delete(url);
  };
  return receiptFactory;
}]);


// Data-binding debugging tool
// Uncomment all this and whenever an expression {{ }} is evaluated,
// results will log to the console.
// app.config(['$provide', function ($provide) {
//   $provide.decorator("$interpolate", ['$delegate', function ($delegate) {
//     var interpolateWrap = function() {
//       var interpolationFn = $delegate.apply(this, arguments);
//         if(interpolationFn) {
//           return interpolationFnWrap(interpolationFn, arguments);
//         }
//     };
//     var interpolationFnWrap = function(interpolationFn, interpolationArgs) {
//       return function() {
//         var result = interpolationFn.apply(this, arguments);
//         var log = result ? console.log : console.warn;
//         log.call(console, "interpolation of  " + interpolationArgs[0].trim(),
//             ":", result.trim());
//         return result;
//       };
//     };
//     angular.extend(interpolateWrap, $delegate);
//     return interpolateWrap;
//   }]);
// }]);







