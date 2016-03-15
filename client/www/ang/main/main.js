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
    $ionicPopup) {

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
      // socket.emit(acceptInvite, {
      //   invitation: invitation,
      //   name: store.get('profile').name
      // });
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
      // socket.emit(declineInvite, {
      //   invitation: invitation,
      //   name: store.get('profile').name
      // });
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
    $state.go('game');
  };


  $scope.getFriends();
  $scope.getInvitations();
  Game.updateGame();

  socket.on('invited', function () {
    $scope.getInvitations();
  });
  

  //Would be better along is authenticated redirect around/from login
  // socket.emit('onlineCheck', {
  //   user_fb: store.get('profile').user_id.split('|')[1],
  //   name: store.get('profile').name
  // });
});
