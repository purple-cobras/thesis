angular.module('app.main', [])

.controller('mainCtrl', function($scope, $state, $ionicHistory, Facebook, store) {
  
  $scope.friends = [];

  $scope.account = function () {
    $ionicHistory.goBack();
  }

  $scope.getFriends = function () {
    Facebook.api('/me/friends?access_token=' + store.get('fb_access_token'), function (response) {
      //TODO: FB authentication expired, handle this error
      if (response.error) {

      } else {
        console.log(response);
        $scope.friends = response;
      }
    });
  };

  $scope.getFriends()

});