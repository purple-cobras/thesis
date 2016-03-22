angular.module('app.login', [])

.controller('loginCtrl', function(
  $rootScope, 
  $scope, 
  store, 
  $state, 
  auth, 
  $ionicHistory, 
  $http, 
  Game, 
  Auth, 
  socket, 
  Facebook
) {

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
          store.set('games_played', response.data.games.length);
          store.set('created_at', response.data.user.created_at);
          store.set('remote_id', response.data.user.id);
          store.set('current_game_id', response.data.user.current_game_id);
          setProfile();
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
    clearProfile();
    Auth.logout();
  };

  var getProfilePic = function () {
    var facebookId = store.get('profile').user_id.split('|')[1];
    var query = '/' + facebookId + '/picture?access_token=' + store.get('fb_access_token') + '&type=normal';
    return Facebook.api(query, function (response) {
        if (response.error) {
          console.log('Facebook API error: ', response.error);
          return;
        } 
        store.set('pic_url', response.data.url);
      }
    )
  };

  var setProfile = function () {
    getProfilePic().then(function() {
      $scope.profile = {
        name: store.get('profile').name,
        picUrl: store.get('pic_url'),
        gamesPlayed: store.get('games_played'),
        createdAt: store.get('created_at')
      };
    });
  };

  var clearProfile = function () {
    $scope.profile = {
      name: '',
      picUrl: '',
      gamesPlayed: '',
      createdAt: ''
    };
  }

  var establish = function () {
    socket.emit('establish', {
      id: store.get('remote_id')
    });
  };

  if (auth.isAuthenticated) {
    setProfile();
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
