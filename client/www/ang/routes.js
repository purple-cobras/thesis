angular.module('app.routes',
  [
    'auth0',
    'angular-storage',
    'angular-jwt'
  ]
)

.config(function($stateProvider, $urlRouterProvider, authProvider, $httpProvider, jwtInterceptorProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


  .state('login', {
    url: '/login',
    templateUrl: 'ang/login/login.html',
    controller: 'loginCtrl'
  })

  .state('main', {
    url: '/main',
    templateUrl: 'ang/main/main.html',
    controller: 'mainCtrl',
    block: true
  })

  .state('newGame', {
    url: '/newgame',
    templateUrl: 'ang/newGame/newGame.html',
    controller: 'newGameCtrl',
    block: true
  })

  .state('game', {
    url: '/play',
    templateUrl: 'ang/game/game.html',
    controller: 'gameCtrl',
    block: true
  });

$urlRouterProvider.otherwise('/login');

authProvider.init({
  domain: 'purplecobras.auth0.com',
  clientID:'UUf4W3Rz7wReJq03Pg6eta3vGOFfwg11',
  loginState: 'login'
});
})

.run(function ($rootScope, $location, auth, $state) {
  $rootScope.$on('$stateChangeStart', function (evt, next, current) {
    if (next && next.block && !auth.isAuthenticated) {
      $state.go('login');
    }
  });

});
