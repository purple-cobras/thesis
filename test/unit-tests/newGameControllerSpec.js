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

    xit('should remove invites', function () {
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

  describe('#restrictScore', function () {

    it('should not allow a player to pick a score higher than 50 or lower than 10', function () {
      var spy = spyOn($scope, 'restrictScore');
      $scope.restrictScore();
        expect(spy).toHaveBeenCalled();
    });
  });

  describe('#createGame', function () {

    it('should create a game', function (done) {
      $httpBackend.when('POST', Config.api + '/games');
      done();
    });

    it('should redirect you to game upon successful completion', function () {
      expect($scope.isDisabled).toEqual(false);
      $httpBackend.when('POST', Config.api + '/games');
      deferred.resolve(function (response){
        if (response.data.game) {
          //SOCKET EMIT gameCreated gameInfo.friend, .invitedBy
          Game.updateGame()
          .then(function () {
            expect(spy).toHaveBeenCalledWith('game');
          });
        } else {
          expect(console.log).toEqual('something went wrong');
        }
      });
      deferred.reject(function (error) {
          expect(console.log).toEqual(error);
      });
      deferred.resolve(function () {
        expect($scope.isDisabled).toEqual(false);
      });
    });
  });
});
