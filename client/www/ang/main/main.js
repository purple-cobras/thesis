angular.module('app.main', [])

.controller('mainCtrl', function($scope, $state, $ionicHistory) {
  $scope.account = function () {
    $ionicHistory.goBack();
  }
});