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

  $scope.Game.remote_id = store.get('remote_id');

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

  console.log($scope.Game);

  $scope.displayGuessChoices = function (response_id, $event) {
    var buttons = [];
    for (var i = 0; i < $scope.Game.game.players.length; i++) {
      if ($scope.Game.game.players[i].id !== store.get('remote_id')) {
        var guessed = false;
        for (var j = 0; j < $scope.Game.game.current_round.responses.length; j++) {
          if($scope.Game.game.current_round.responses[j].guessed && $scope.Game.game.players[i].id === $scope.Game.game.current_round.responses[j].user_id) {
            guessed = true;
          }
        }
        if (!guessed) {
          buttons.push({
            text: $scope.Game.game.players[i].full_name,
            type: 'button',
            onTap: function (i) {
              return function() {
                Game.submitGuess({
                  response_id: response_id,
                  guesser_id: store.get('remote_id'),
                  guessee_id: $scope.Game.game.players[i].id
                })
                .then( function (res) {
                  if (res.data.result === true) {
                    $($event.target).text($($event.target).text() + ' - Guessed correctly as ' + $scope.Game.game.players[i].full_name);
                  }
                });
              };
            }(i)
          });
        }
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
