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

  var params = {
    authParams: {
      scope: 'openid offline_access',
      device: 'Mobile device'
    }
  };

  $scope.auth = auth;

  $scope.login = function () {
    auth.signin(params, handleUser, handleFailedSignin);
  };

  $scope.logout = function () {
    Game.resetGame();
    clearProfile();
    Auth.logout();
  };

  $scope.iOS = function () {
    return ionic.Platform.isIOS();
  };

  if (auth.isAuthenticated) {
    setProfile();
    establish();
    socket.on('connect', function () {
      establish();
    });
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $state.go('main');
  }

  function handleUser (profile, token, accessToken, state, refreshToken) {
    var facebookId = profile.user_id.split('|')[1];
    store.set('profile', profile);
    store.set('token', token);
    store.set('refreshToken', refreshToken);
    store.set('fb_access_token', profile.identities[0].access_token);
    // console.log('***fb_access_token***', store.get('fb_access_token'));
    $http({
      method: 'post',
      url: Config.api + '/signin',
      data: {
        name: profile.name,
        pic_url: profile.picture,
        facebookId: facebookId,
        device_token: store.get('device_token')
      }
    })
    .then(function (response) {
      if (response.data.user) {
        // store.set('fb_access_token', response.data.fb_access_token)
        store.set('games_won', response.data.games.won);
        store.set('games_played', response.data.games.played);
        store.set('created_at', response.data.user.created_at);
        store.set('remote_id', response.data.user.id);
        store.set('current_game_id', response.data.user.current_game_id);
        setProfile();
        Game.game.id = response.data.user.current_game_id;
        Game.getGame();
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

    function setAndPost() {

    }
  };

  function handleFailedSignin(error) {
    $scope.logout();
  }

  function getProfilePic() {
    var facebookId = store.get('profile').user_id.split('|')[1];
    var query = '/' + facebookId + '/picture?access_token=' + store.get('fb_access_token') + '&type=normal';
    return Facebook.api(query, function (response) {
        if (response.error) {
          console.log('Facebook API error: ', response.error);
          return;
        }
        store.set('pic_url', response.data.url);
      }
    );
  };

  function setProfile() {
    getProfilePic().then(function() {
      $scope.profile = {
        name: store.get('profile').name,
        picUrl: store.get('pic_url'),
        gamesWon: store.get('games_won'),
        gamesPlayed: store.get('games_played'),
        createdAt: store.get('created_at')
      };
    });
  };

  function clearProfile() {
    $scope.profile = {
      name: '',
      picUrl: '',
      gamesPlayed: '',
      createdAt: ''
    };
  };

  function establish() {
    socket.emit('establish', {
      id: store.get('remote_id')
    });
    var game_id = store.get('current_game_id');
    if (game_id) {
      socket.emit('room', game_id);
    }
  };

});
