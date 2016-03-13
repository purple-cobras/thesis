angular.module('app.main', [])

.controller('mainCtrl', function($scope, $state, $ionicHistory, Facebook, store, $rootScope, $http, Sockets) {

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
      console.error(error);
    });
  };

  $scope.accept = function (invitation) {
    $http({
      url: Config.api + '/invitations/accept',
      method: 'post',
      data: {invitation: invitation}
    })
    .then(function (response) {
      socket.emit(acceptInvite, {
        invitation: invitation,
        name: store.get('profile').name
      });
      console.log(response);
    })
    .catch(function (error) {
      console.error(error);
    });
  };

  $scope.decline = function (invitation) {
    $http({
      url: Config.api + '/invitations/decline',
      method: 'post',
      data: {invitation: invitation}
    })
    .then(function (response) {
      socket.emit(declineInvite, {
        invitation: invitation,
        name: store.get('profile').name
      });
      console.log(response);
    })
    .catch(function (error) {
      console.error(error);
    });
  };

  $scope.getFriends = function () {
    Facebook.api('/me/friends?access_token=' + store.get('fb_access_token'), function (response) {
      //TODO: FB authentication expired, handle this error
      if (response.error) {

      } else {
        $rootScope.friends = response.data;
      }
    });
  };

  $scope.getFriends();
  $scope.getInvitations();

  //Would be better along is authenticated redirect around/from login
  socket.emit('onlineCheck', {
    user_fb: store.get('profile').user_id.split('|')[1],
    name: store.get('profile').name
  });
});
