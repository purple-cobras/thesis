angular.module('app.login', [])

.controller('loginCtrl', function($rootScope, $scope, store, $state, auth, $ionicHistory, $http) {
  $scope.auth = auth;
  $scope.login = function () {
    auth.signin({
      authParams: {
        scope: 'openid offline_access',
        device: 'Mobile device'
      },
    }, function (profile, token, accessToken, state, refreshToken) {
      store.set('profile', profile);
      store.set('fb_access_token', profile.identities[0].access_token);
      store.set('token', token);
      store.set('refreshToken', refreshToken);
      $http({
        method: 'post',
        url: Config.api + '/signin',
        data: {name: profile.name, pic_url: profile.picture}
      })
      .then(function (response) {
        if (response.data.user) {
          store.set('remote_id', response.data.user.id);
          $state.go('main');
        } else {
          $scope.logout();
        }
      })
      .catch(function (error) {
        $scope.logout();
      });
    }, function (error) {
      $scope.logout();
    });
  };

  $scope.logout = function () {
    auth.signout();
    store.remove('profile');
    store.remove('token');
    store.remove('fb_access_token');
    store.remove('remote_id');
    $state.go('login');
  };

  if (auth.isAuthenticated) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    })
    $state.go('main');
  }
});
