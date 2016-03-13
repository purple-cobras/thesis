angular.module('app.game', [])

.controller('gameCtrl', function($scope, $ionicHistory, Sockets) {
  
  $scope.back = function () {
    $ionicHistory.goBack(-2);
  };
});