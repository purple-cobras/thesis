angular.module('app.login', [])

.controller('loginCtrl', function($rootScope, $scope, store, $state, auth, $ionicHistory, $http, Game, Auth, socket) {
  $scope.auth = auth;

  $scope.login = function () {
    auth.signin({
      authParams: {
        scope: 'openid offline_access',
        device: 'Mobile device'
      },
    }, function (profile, token, accessToken, state, refreshToken) {
      console.log('profile: ', profile)
      store.set('profile', profile);
      store.set('pic_url', profile.picture);
      store.set('name', profile.name);
      store.set('fb_access_token', profile.identities[0].access_token);
      store.set('token', token);
      store.set('refreshToken', refreshToken);
      $http({
        method: 'post',
        url: Config.api + '/signin',
        data: {name: profile.name, pic_url: profile.picture}
      })
      .then(function (response) {
        // console.log('response.data.user: ', response.data.user)
        if (response.data.user) {
          store.set('games', response.data.games.length);
          store.set('created_at', response.data.user.created_at);
          $scope.profile = {
            name: store.get('name'),
            pic_url: store.get('pic_url'),
            games: store.get('games'),
            created_at: store.get('created_at')
          }
          store.set('remote_id', response.data.user.id);
          store.set('current_game_id', response.data.user.current_game_id);
          Game.game.id = response.data.user.current_game_id;
          Game.getGame();
          //SOCKET EMIT login userInfo.fb ,.name
          socket.emit('login', {
            id: response.data.user.id
          });
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
    Auth.logout();
  };

  var establish = function () {
    socket.emit('establish', {
      id: store.get('remote_id')
    });
  };

  if (auth.isAuthenticated) {
    establish();
    socket.on('connect', function () {
      establish();
    });
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    })
    $state.go('main');
  }



});
