
describe('mainCtrl', function () {
  var $rootScope, $q, deferred, $scope, store, $state, socket, $ionicPopup, Facebook,createController, Game, Auth,$ionicHistory, $http, $httpBackend, $controller;


  beforeEach(module('app'));
  beforeEach(inject(function ($injector, _$q_) {

    $q = _$q_;
    deferred = _$q_.defer();
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    store = $injector.get('store');
    Game  = $injector.get('Game');
    $ionicHistory = $injector.get('$ionicHistory');
    $http = $injector.get('$http');
    $controller = $injector.get('$controller');
    $state = $injector.get('$state');
    Auth = $injector.get('Auth');
    socket = $injector.get('socket');
    Facebook = $injector.get('Facebook');
    $ionicPopup = $injector.get('$ionicPopup');

    createController = function () {
      return $controller('mainCtrl', {
        $rootScope: $rootScope,
        $scope: $scope,
        store: store,
        Facebook: Facebook,
        Game: Game,
        $ionicHistory: $ionicHistory,
        $http: $http,
        $state: $state,
        Auth: Auth,
        socket: socket
      });
    };

  }));

  beforeEach(function () {
      createController();
  });

  describe('#newGame', function () {

    it('should have a newGame method on the $scope', function () {
      expect($scope.newGame).toEqual(jasmine.any(Function));
    });

    it('should redirect to newGame when select', function (done) {
      var spy = spyOn($state, 'go');
      deferred.resolve($state.go('newGame'));
      expect(spy).toHaveBeenCalledWith('newGame');
      done();
    });
  });

  describe('#invitations', function () {

    it('should have an array of invitations', function () {
      expect($scope.invitations).toEqual(jasmine.any(Array));
    });
  });
});
