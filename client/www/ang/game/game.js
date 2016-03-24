angular.module('app.game', [])

.controller('gameCtrl', function(
  $scope,
  $ionicHistory,
  $http,
  Game,
  store,
  $ionicPopup,
  $ionicScrollDelegate,
  $ionicPlatform,
  socket,
  $timeout,
  ionicToast
) {

  angular.extend($scope, Game);

  $scope.Game = Game;

  $scope.Game.topic = '';

  $scope.Game.response = '';

  $scope.typingResponse = false;

  $scope.typingTopic = false;

  $scope.kicked = false;

  $scope.Game.remote_id = store.get('remote_id');

  $scope.toggleTypingTopic = function (val) {
    $scope.typingTopic = val;
  }

  $scope.back = function () {
    var history = $ionicHistory.viewHistory();
    if (history.currentView.backViewId !== "ion3") {
      $ionicHistory.goBack(-2);
    } else {
      $ionicHistory.goBack();
    }
  };

  $scope.kickoff = function () {
    $scope.kicked = true;
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
    if (!responsiveVoice.isPlaying()) {
      responsiveVoice.speak('');
    }
    Game.submitTopic()
    .then(function () {
      $ionicScrollDelegate.scrollTop(true);
    });
  };

  $scope.submitRes = function () {
    if (!responsiveVoice.isPlaying()) {
      responsiveVoice.speak('');
    }
    Game.submitResponse()
    .then(function () {
      $ionicScrollDelegate.scrollTop(true);
    });
  };

  $scope.playerIndex = function (response) {
    for (var i = 0; i < $scope.game.players.length; i++) {
      if ($scope.game.players[i].id === response.user_id) {
        return i;
      }
    }
  };

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

  $scope.$on('$ionicView.enter', function () {
    Game.getGame()
    .then(function () {
    });
  });

  $scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
    var scrollPosition = $ionicScrollDelegate.getScrollPosition().top;
    if (newHeight > oldHeight) {
      $ionicScrollDelegate.scrollTo(0, $ionicScrollDelegate.getScrollPosition().top + (newHeight - oldHeight), true);
    }
  });



  $ionicPlatform.on('resume', function () {
    Game.updateGame();
  });

  socket.on('scrollTop', function () {
    $ionicScrollDelegate.scrollTop(true);
  });

  $scope.$watch('Game.response', function() {
    if (Game.response.length > 255) {
      Game.response = Game.response.substring(0, 255);
      ionicToast.show('Max response length', 'top', false, 2500);
    }
  });

  $scope.$watch('Game.topic', function() {
    if (Game.topic.length > 255) {
      Game.topic = Game.topic.substring(0, 255);
      ionicToast.show('Max response length', 'top', false, 2500);
    }
  });

});
