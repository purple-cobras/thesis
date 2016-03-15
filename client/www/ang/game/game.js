angular.module('app.game', [])

.controller('gameCtrl', function($scope, $ionicHistory, $http, Game, store) {

  angular.extend($scope, Game);

  $scope.typingResponse = false;

  $scope.typingTopic = false;

  $scope.back = function () {
    var history = $ionicHistory.viewHistory();
    if (history.currentView.backViewId !== "ion3") {
      $ionicHistory.goBack(-2);
    } else {
      $ionicHistory.goBack();
    }
  };

  Game.getGame();

});