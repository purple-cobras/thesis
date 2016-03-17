describe('newGameCtrl', function () {
  var $rootScope, $q, deferred, $scope, store, $state, spy, $ionicPopup, createController, Game, $ionicHistory, $http, $httpBackend, $controller;


  beforeEach(module('app'));
  beforeEach(inject(function ($injector) {

    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');
    deferred = $q.defer();
    $scope = $rootScope.$new();
    Game  = $injector.get('Game');
    $http = $injector.get('$http');
    $controller = $injector.get('$controller');
    $state = $injector.get('$state');
    $httpBackend = $injector.get('$httpBackend');
    spy = spyOn($state, 'go');

    createController = function () {
      return $controller('newGameCtrl', {
        $scope: $scope,
        Game: Game,
        $http: $http,
        store: store
      });
    };

  }));

  beforeEach(function () {
      createController();
  });

  describe('#toggleInvite', function () {

    it('should have a toggle invite function', function () {
      expect($scope.toggleInvite).toEqual(jasmine.any(Function));
    });

    it('should do something with remove invites', function () {
      var friend = {};
      if($scope.inviting[friend.id]){
        delete $scope.inviting[friend.id];
      } else {
        $scope.inviting[friend.id] = true;
      }
      var count = Object.keys($scope.inviting).length;
      if (!count) {
        $('.friends-count').text('');
      } else {
        $('.friends-count').text('(' + count + ' invited)');
      }
    });
  });
});
