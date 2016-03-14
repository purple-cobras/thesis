angular.module('app.game', [])

.controller('gameCtrl', function($scope, $ionicHistory, $http) {

  $scope.back = function () {
    var history = $ionicHistory.viewHistory();
    if (history.currentView.backViewId !== "ion3") {
      $ionicHistory.goBack(-2);
    } else {
      $ionicHistory.goBack();
    }
  };

});