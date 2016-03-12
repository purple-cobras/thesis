// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app',
  [ 'ionic',
    'app.routes',
    'app.services',
    'app.directives',
    'app.main',
    'app.game',
    'app.login',
    'app.newGame',
    'auth0',
    'angular-storage',
    'facebook',
    'angular-jwt'
  ]
)

.run(function($ionicPlatform, $rootScope, auth, store, jwtHelper, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs
    $rootScope.friends = [];

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  auth.hookEvents();

  var refreshingToken = null;
  $rootScope.$on('$locationChangeStart', function () {
    var token = store.get('token');
    var refreshToken = store.get('refreshToken');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
        }
      } else {
        if (refreshToken) {
          if (refreshingToken === null) {
            refreshingToken = auth.refreshIdToken(refreshToken)
            .then(function (idToken) {
              store.set('token', idToken);
              auth.authenticate(store.get('profile', idToken));
            })
            .finally(function () {
              refreshingToken = null;
            });
          }
          return refreshingToken;
        } else {
          $state.go('login');
        }
      }
    }
  });
})

// Basic config
.run(function ($rootScope, auth, $location) {
  $rootScope.appName = 'Game of Things';
  $rootScope.Utils = {
     keys : Object.keys
  }


})


.config(function (authProvider, $httpProvider, jwtInterceptorProvider) {
  jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
    var idToken = store.get('token');
    var refreshToken = store.get('refreshToken');
    // If no token return null
    if (!idToken || !refreshToken) {
      return null;
    }
    // If token is expired, get a new one
    if (jwtHelper.isTokenExpired(idToken)) {
      return auth.refreshIdToken(refreshToken).then(function(idToken) {
        store.set('token', idToken);
        return idToken;
      });
    } else {
      return idToken;
    }
  }

  $httpProvider.interceptors.push('jwtInterceptor');
})

.config(function (FacebookProvider) {
  FacebookProvider.init('1118852854832411');
});
