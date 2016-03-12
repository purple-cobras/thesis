angular.module('app.main', [])

.controller('mainCtrl', function($scope, $state, $ionicHistory, Facebook, store, $rootScope, $http) {


  $scope.invitations = [];

  $scope.account = function () {
    $ionicHistory.goBack();
  };

  $scope.getInvitations = function () {
    $http({
      url: Config.api + '/invitations',
      method: 'get'
    })
    .then(function (response) {
      $scope.invitations = response.data.invitations;
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

});
