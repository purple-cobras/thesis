angular.module('app.game', [])

.controller('gameCtrl', function($scope, $ionicHistory) {
  
  $scope.back = function () {
    $ionicHistory.goBack(-2);
  };
});