
describe('mainCtrl', function () {
  var $rootScope, $q, deferred, $scope, store, $state, socket, spy, $ionicPopup, Facebook,createController, Game, Auth,$ionicHistory, $http, $httpBackend, $controller;


  beforeEach(module('app'));
  beforeEach(inject(function ($injector) {

    $q = $injector.get('$q');
    deferred = $q.defer();
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
    $httpBackend = $injector.get('$httpBackend');
    spy = spyOn($state, 'go');

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
      deferred.resolve($state.go('newGame'));
      expect(spy).toHaveBeenCalledWith('newGame');
      done();
    });
  });

  describe('#invitations', function () {

    it('should have an array of invitations', function () {
      expect($scope.invitations).toEqual(jasmine.any(Array));
    });

    it('should have an getInvitations function', function () {
      expect($scope.getInvitations).toEqual(jasmine.any(Function));
    });

    it('should get invitations', function (done) {
      $httpBackend.when('GET', Config.api + '/invitations').respond(function(response){
        if(response.data.invitations) {
          response.data.invitations.forEach(function(invitation) {
            if (invitation.creator.id !== store.get('remote_id')) {
              $scope.invitiations.push(invitation);
            }
          });
        }
    });
      done();
    });

    it('should log an error when the get request fails', function (done) {
      deferred.reject($scope.getInvitations());
      done();
    });
  });

  describe('#accept', function () {

    it('should have a function that accepts games', function () {
      expect($scope.accept).toEqual(jasmine.any(Function));
    });

    it('should post data to /invitations', function (done) {
      $httpBackend.when('POST', Config.api + '/invitations').respond(200, $scope.invitations);
      done();
    });

    it('should update the game when there is an invitation', function () {
      $scope.updateGame();
    });

    it('should redirect to game page upon success', function (done) {
      deferred.resolve($state.go('game'));
      expect(spy).toHaveBeenCalledWith('game');
      done();
    });

    it('should thrown an error when it fails', function () {
      deferred.reject($scope.accept());
    });
  });

  describe('#decline', function () {

    it('should have a decline invitation function', function () {
      expect($scope.decline).toEqual(jasmine.any(Function));
    });

    it('should post data to invitations', function () {
      $httpBackend.when('POST', Config.api + '/invitations').respond(200, $scope.invitations);
    });

    it('should remove an invitation', function () {
      deferred.resolve($scope.removeInvitation());
    });

    it('should throw an erorr if it cannot', function () {
      deferred.reject($scope.removeInvitation());
    });
  });

  describe('#getFriends', function () {

    it('should have a getFriends function', function () {
      expect($scope.getFriends).toEqual(jasmine.any(Function));
    });

    it('should send an api request to Facebook', function () {
      Facebook.api('/me/friends?access_token=' + store.get('fb_access_token'), function (response) {
        if (response.error) {
          expect(response.error).toEqual(console.error('FB authentication error: ', error));
          Auth.logout();
          expect(spy).toHaveBeenCalledWith('login');
        } else {
          expect($rootScope.friends).toEqual(response.data);
        }
      });
    });
  });
});
