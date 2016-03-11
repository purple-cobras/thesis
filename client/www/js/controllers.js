angular.module('app.controllers', [])
  
.controller('loginCtrl', function($rootScope, $scope, store, $state, auth, $ionicHistory) {
  $scope.auth = auth;
  $scope.login = function () {
    auth.signin({
      authParams: {
        scope: 'openid offline_access',
        device: 'Mobile device'
      },
    }, function (profile, token, accessToken, state, refreshToken) {
      store.set('profile', profile);
      store.set('token', token);
      store.set('refreshToken', refreshToken);
      $state.go('main');
    }, function (error) {
      console.log(error);
    });
  };

  $scope.logout = function () {
    auth.signout();
    store.remove('profile');
    store.remove('token');
    $state.go('login');
  };

  if (auth.isAuthenticated) {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    })
    $state.go('main');
  }
})
   
.controller('mainCtrl', function($scope, $state, $ionicHistory) {
  $scope.account = function () {
    $ionicHistory.goBack();
  }
})
   
.controller('newGameCtrl', function($scope) {

})
   
.controller('gameCtrl', function($scope) {

})
 