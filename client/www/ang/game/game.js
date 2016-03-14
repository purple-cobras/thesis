angular.module('app.game', [])

.controller('gameCtrl', function($scope, $ionicHistory, $http) {

  $scope.back = function () {
    $ionicHistory.goBack(-2);
  };

});