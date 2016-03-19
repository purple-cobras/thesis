angular.module('app.game', [])

.controller('gameCtrl', function(
  $scope,
  $ionicHistory,
  $http,
  Game,
  store,
  $ionicPopup,
  $ionicScrollDelegate
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
  };

  $scope.processPlayerSelection = function (player, $event) {
    if (!Game.amGuesser() ||
        (Game.game.current_round.guesses && Game.game.current_round.guesses[player.id]) ||
        player.id === store.get('remote_id')) {
      return;
    } else {
      if (Game.guess.user === player) {
        Game.guess.user = undefined;
      } else {
        Game.guess.user = player;
      }
    }
  };

  $scope.processResponseSelection = function (response, $event) {
    if (!Game.amGuesser() || response.guessed || response.user_id === store.get('remote_id')) {
      return;
    } else {
      if (Game.guess.response === response) {
        Game.guess.response = undefined;
      } else {
        Game.guess.response = response;
      }
    }
  };

  $scope.submitTop = function () {
    Game.submitTopic()
    .then(function () {
      $ionicScrollDelegate.scrollTop(true);
    });
  };

  $scope.submitRes = function () {
    Game.submitResponse()
    .then(function () {
      $ionicScrollDelegate.scrollTop(true);
    });
  };

  $scope.playerIndex = function (response) {
    var player = $scope.game.players.find(function (player) {
      return player.id === response.user_id;
    });
    return $scope.game.players.indexOf(player);
  }

  $scope.icons = [
    'ion-ios-flower',
    'ion-ios-rose',
    'ion-ios-paw',
    'ion-ios-flame',
    'ion-ios-sunny',
    'ion-ios-cloudy',
    'ion-ios-thunderstorm',
    'ion-ios-snowy',
    'ion-ios-moon',
    'ion-ios-cloudy-night',
    'ion-ios-flower-outline',
    'ion-ios-rose-outline',
    'ion-ios-paw-outline',
    'ion-ios-flame-outline',
    'ion-ios-sunny-outline',
    'ion-ios-cloudy-outline',
    'ion-ios-thunderstorm-outline',
    'ion-ios-snowy-',
    'ion-ios-moon-outline',
    'ion-ios-cloudy-night-outline'
  ];


  Game.getGame();

  /*$scope.displayGuessChoices = function (response_id, $event) {
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
                    $($event.target).text($($event.target).text());
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
  }*/

});
