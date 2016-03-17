describe('gameCtrl', function () {
  var $rootScope, $q, deferred, $scope, store, $state, spy, $ionicPopup, createController, Game, $ionicHistory, $http, $httpBackend, $controller;


  beforeEach(module('app'));
  beforeEach(inject(function ($injector) {

    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');
    deferred = $q.defer();
    $scope = $rootScope.$new();
    Game  = $injector.get('Game');
    $ionicHistory = $injector.get('$ionicHistory');
    $http = $injector.get('$http');
    $controller = $injector.get('$controller');
    $state = $injector.get('$state');
    $httpBackend = $injector.get('$httpBackend');
    spy = spyOn($state, 'go');

    createController = function () {
      return $controller('gameCtrl', {
        $scope: $scope,
        Game: Game,
        $ionicHistory: $ionicHistory,
        $http: $http,
        store: store
      });
    };

  }));

  beforeEach(function () {
      createController();
  });

  describe('#back', function () {

    it('should have a back function', function () {
      expect($scope.back).toEqual(jasmine.any(Function));
    });

    xit('should do something with IonicHistory', function () {

    });
  });
});
