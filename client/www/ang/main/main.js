

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
    ionicToast) {

  angular.extend($scope, Game);

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

  socket.on('invited', function () {
    $scope.getInvitations();
  });

  socket.on('refreshInvites', function () {
    ionicToast.show('Missed the boat', 'top', false, 2000);
    $scope.getInvitations();
  });

});
