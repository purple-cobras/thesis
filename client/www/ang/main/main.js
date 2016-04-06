

angular.module('app.main', [])

.controller('mainCtrl', function(
    $scope,
    $state,
    $ionicHistory,
    Facebook,
    store,
    $rootScope,
    $http,
    Game,
    Auth,
    socket,
    $ionicPopup,
    $ionicModal,
    $ionicSlideBoxDelegate,
    ionicToast) {

  angular.extend($scope, Game);

  $scope.instructions = [
    {
      title: "Welcome",
      body: "If you are new to <strong>Black Mamba</strong>, let us show you the ropes! Otherwise feel free to jump right in.",
      icon: "ion-happy-outline"
    }, 
    {
      title: "Basics",
      body: "<strong>Black Mamba</strong> is a great party game. You need at least two other friends to play. They can be using either iOS or Android devices.",
      icon: "ion-android-contacts"
    },
    {
      title: "Topics",
      body: "In reach round of the game, one player (designated as <strong>The Reader</strong>) puts forth a topic. The topic is typically a question, but it can really be anything. One example might be <em>\"What is something you do not want to find in your bed in the morning?\"</em>",
      icon: "ion-edit"
    },
    {
      title: "Responses",
      body: "Once the topic has been set, each player submits a response. A response can really be anything, but you'll want to try to come up with something that is both relevant to the topic and is going to make your friends laugh.",
      icon: "ion-ios-chatboxes-outline"
    },
    {
      title: "Guessing",
      body: "After all responses have been submitted, they will be read aloud by <strong>The Reader's</strong> device. Then, players take turns trying to match up who wrote which response. If you guess correctly, you get to guess again. If you guess incorrectly, the next player gets to start guessing. You receive a point for each correct guess, and a bonus point for being the last woman or man standing.",
      icon: "ion-ribbon-a"
    },
    {
      title: "MambaBot",
      body: "You have the option to include an AI player in your games, named <strong>MambaBot</strong>. MambaBot will never come up with topics or responses. Rather, she makes educated guesses based on  quantitative analysis performed on each player's previous responses. We truly hope that she does not grow intelligent enough to lead the inevitable cyborg takeover of the human race.",
      icon: "ion-outlet"
    },
    {
      title: "That's it!",
      body: "Get Mamba-ing!",
      icon: "ion-university"
    }

  ];

  $scope.isDisabled = false;
  $scope.invitations = [];

  $scope.newGame = function () {
    $scope.isDisabled = true;
    $state.go('newGame');
    $scope.isDisabled = false;
  };

  $scope.account = function () {
    $ionicHistory.goBack();
  };

  $scope.getInvitations = function () {
    $http({
      url: Config.api + '/invitations',
      method: 'get'
    })
    .then(function (response) {
      if (response.data.invitations) {
        $scope.invitations = [];
        response.data.invitations.forEach(function(invitation) {
          if (invitation.creator.id !== store.get('remote_id')) {
            $scope.invitations.push(invitation);
          }
        });
      }
    })
    .catch(function (error) {
      console.dir(error);
    });
  };

  $scope.accept = function (invitation) {
    $http({
      url: Config.api + '/invitations',
      method: 'post',
      data: {
        invitation: invitation,
        accept: true
      }
    })
    .then(function (response) {
      if (response.status === 200) {
        $scope.removeInvitation(invitation);
      }
      $scope.updateGame()
      .then(function () {
        $state.go('game');
      });
    })
    .catch(function (error) {
      console.error(error);
    });
  };

  $scope.decline = function (invitation) {
    $http({
      url: Config.api + '/invitations',
      method: 'post',
      data: {
        invitation: invitation,
        accept: false
      }
    })
    .then(function (response) {
      if (response.status === 200) {
        $scope.removeInvitation(invitation);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
  };

  $scope.getFriends = function () {
    Facebook.api('/me/friends?access_token=' + store.get('fb_access_token'), function (response) {
      if (response.error) {
        console.error('FB authentication error: ', error);
        Auth.logout();
      } else {
        $rootScope.friends = response.data;
      }
    });
  };

  $scope.removeInvitation = function (invitation) {
    for (var i = 0; i < $scope.invitations.length; i++) {
      if ($scope.invitations[i] === invitation) {
        $scope.invitations.splice(i, 1);
        return;
      }
    }
  };

  $scope.goToGame = function () {
    if (!responsiveVoice.isPlaying()) {
      responsiveVoice.speak('');
    }
    $state.go('game');
  };

  $scope.soundSettingText = function () {
    return $rootScope.mute ? 'Enable sound effects' : 'Disable sound effects';
  };

  $scope.displaySettings = function () {
    var soundText = $scope.soundSettingText();
    $ionicPopup.show({
      title: "Settings",
      scope: $scope,
      buttons: [
        {
          text: soundText,
          type: 'button button-block button-calm sound-setting',
          onTap: function (e) {
            $rootScope.mute = !$rootScope.mute;
            store.set('mute', $rootScope.mute);
            $(e.target).text($scope.soundSettingText());
            e.preventDefault();
          }
        },
        {
          text: 'Done',
          type: 'button button-block button-calm',
          onTap: function (e) {
          }
        },
      ]
    });
  };

  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.getFriends();
    $scope.getInvitations();
    Game.updateGame();
  });

  $scope.$on('$ionicView.afterEnter', function () {
    $ionicModal.fromTemplateUrl('ang/instructions/instructions.html', {
      scope: $scope,
      animation: 'slide-in-up'
    })
    .then(function (modal) {
      $scope.intro = modal;
      if (!store.get('launched')) {
        $scope.intro.show();
      }
    })
    .catch(function (error) {
      console.error(error);
    })
    .finally(function () {
      store.set('launched', true);
    });
  });

  $scope.openIntro = function () {
    $scope.intro.show();
    $ionicSlideBoxDelegate.slide(0);
  };

  socket.on('invited', function () {
    $scope.getInvitations();
  });

  socket.on('refreshInvites', function () {
    ionicToast.show('Missed the boat', 'top', false, 2000);
    $scope.getInvitations();
  });

});
