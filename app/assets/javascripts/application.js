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

  $scope.currentStore = {};
  $scope.status = null;
  // today's receipt total
  $scope.todaysReceiptTotal = 0;
  // placeholder for a new receipt
  $scope.newReceipt = {};
  // placeholder for an edited receipt
  $scope.editReceipt = {};
  // placeholder for an edited profile
  $scope.editProfile = {};
  // start on the Account Profile tab
  $scope.tab = 1;

  $scope.currentStore = getCurrentStore();

  function getCurrentStore() {
    storeFactory.getCurrentStore()
      .success(function(store) {
        $scope.currentStore = store;
        sumTodaysReceipts();
      })
      .error(function(error) {
        $scope.status = 'Error loading data: ' + error.message;
    });
  }

  function sumTodaysReceipts() {
    // pre-processor will choke on this function if $scope.currentStore
    // is null (as it is when pre-processor evaluates this declaration),
    // so give it some dummy data for that case
    var currentStore = $scope.currentStore || { simple_receipts:[] };
    var today = new Date();
    var todaysReceipts, receiptDate, receiptAmounts;
    // factor out the time of day
    today = today.setHours(0,0,0,0);
    // grab today's receipts from current store
    todaysReceipts = currentStore.simple_receipts.filter(function(receipt) {
      receiptDate = new Date(receipt.created_at);
      return receiptDate.setHours(0,0,0,0) == today;
    });
    // convert amounts from string to float
    receiptAmounts = todaysReceipts.map(function(receipt) {
      return parseFloat(receipt.amount);
    });
    // sum the amounts
    $scope.todaysReceiptTotal = receiptAmounts.reduce(function(a, b) {
      return a + b;
    });
    // Below doesn't work. Apparently reduce doesn't like
    // the conversion to float
    // sum = todaysReceipts.reduce(function(a, b) {
    //   return parseFloat(a.amount) + parseFloat(b.amount);
    // });
  }

  $scope.addReceipt = function(currentStore, $event) {
    // fill in the store name and id
    $scope.newReceipt.store_name = $scope.currentStore.name;
    $scope.newReceipt.store_id = $scope.currentStore.id;
    // POST receipt object
    receiptFactory.addReceipt($scope.newReceipt, $scope.currentStore.api_token.hex_value)
      .success(function(data, status) {
        console.log('addReceipt success: ', data, status);
        // add to $scope.currentStore's receipts, latest first
        currentStore.simple_receipts.unshift(data);
        sumTodaysReceipts();
      })
      .error(function(data, status) {
        console.log('addReceipt error: ', data, status);
      });
    // reset newReceipt
    $scope.newReceipt = {};
    // remove focus from button
    $(event.target).find('#new-receipt-submit').blur();
    // sum today's receipts
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
        sumTodaysReceipts();
      })
      .error(function(data, status) {
        console.log(('updateReceipt error: ', data, status));
      });
    // close the modal
    $('#edit-receipt').modal('hide');
    // reset buffer
    $scope.editReceipt = {};
  };

  $scope.removeReceipt = function(receipt) {
    var receipts = $scope.currentStore.simple_receipts;
    if (confirm("Are you sure?")) {
      receipts.splice(receipts.indexOf(receipt), 1);
      receiptFactory.removeReceipt(receipt, $scope.currentStore.api_token.hex_value)
        .success(function(data, status) {
          console.log(data, status);
          sumTodaysReceipts();
        });
    }
  };

  $scope.updateProfile = function() {
    // update $scope
    $scope.currentStore.name = $scope.editProfile.name;
    $scope.currentStore.email = $scope.editProfile.email;
    // PUT updated profile
    storeFactory.updateProfile($scope.editProfile, $scope.currentStore.api_token.hex_value)
      .success(function(data, status) {
        console.log('updateReceipt success: ', data, status);
      })
      .error(function(data, status) {
        console.log(('updateReceipt error: ', data, status));
      });
    // close the modal
    $('#edit-profile').modal('hide');
    // reset buffer
    $scope.editProfile = {};
    // take focus off the button - not working!
    $('#edit-profile-button').blur();
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

  $scope.openEditReceiptModal = function(receipt) {
    $scope.editReceipt.id = receipt.id;
    $scope.editReceipt.item = receipt.item;
    $scope.editReceipt.amount = receipt.amount;
    $scope.editReceipt.transaction_num = receipt.transaction_num;
  };

  $scope.openEditProfileModal = function(currentStore) {
    $scope.editProfile.id = currentStore.id;
    $scope.editProfile.name = currentStore.name;
    $scope.editProfile.email = currentStore.email;
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
  storeFactory.updateProfile = function(editProfile, api_token) {
    var url = '/account.json?api_token=' +
              api_token + '&id=' + editProfile.id;
    return $http.put(url, {store: editProfile});
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







