angular.module('app.game', [])

.controller('gameCtrl', function(
  $scope,
  $ionicHistory,
  $http,
  Game,
  store,
  $ionicPopup
) {

  angular.extend($scope, Game);

  $scope.Game = Game;

  $scope.Game.topic = '';

  $scope.Game.response = '';

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

  $scope.kickoff = function () {
    Game.startGame();
  }

  Game.getGame();

  $scope.listChoices = function () {
    var buttons = [];
    for (var i = 0; i < $scope.Game.game.players.length; i++) {
      if ($scope.Game.game.players[i].id !== store.get('remote_id')) {
        buttons.push({
          text: $scope.Game.game.players[i].full_name,
          type: 'button',
          onTap: function (i) {
            return function() {
              console.log($scope.Game.topic);
            }
          }(i)
        });
      }
    }
    var popup = $ionicPopup.show({
      template: '',
      title: $scope.Game.topic,
      scope: $scope,
      buttons: buttons
    });
  }

});
