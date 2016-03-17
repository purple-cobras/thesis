
describe('loginCtrl', function () {
    var $rootScope, $q, deferred, $scope, store, $state, spy, socket, createController, auth, Auth,$ionicHistory, $http, $httpBackend, $controller;


    beforeEach(module('app'));
    beforeEach(inject(function ($injector) {

        $q = $injector.get('$q');
        deferred = $q.defer();
        $rootScope = $injector.get('$rootScope');
        $scope = $rootScope.$new();
        store = $injector.get('store');
        auth  = $injector.get('auth');
        $ionicHistory = $injector.get('$ionicHistory');
        $http = $injector.get('$http');
        $controller = $injector.get('$controller');
        $state = $injector.get('$state');
        Auth = $injector.get('Auth');
        socket = $injector.get('socket');
        spy = spyOn($state, 'go');

        createController = function () {
          return $controller('loginCtrl', {
            $rootScope: $rootScope,
            $scope: $scope,
            store: store,
            auth: auth,
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

  describe('#login', function() {

    it('should have a login method on the $scope', function () {
        expect($scope.login).toEqual(jasmine.any(Function));
    });

    it('if successful, should change to state to main', function(done) {

        deferred.resolve($state.go('main'));
        $scope.login();
        expect(spy).toHaveBeenCalledWith('main');
        done();
    });

    it('if failure, should change state to login', function(done) {
        deferred.reject($state.go('login'));
        expect(spy).toHaveBeenCalledWith('login');
        done();
    });
  });

  describe('#logout', function () {
    it('should have a logout method on the $scope', function () {
        expect($scope.logout).toEqual(jasmine.any(Function));
    });



    it('should call logout when account is logged out', function () {
        $scope.logout();
        expect(spy).toHaveBeenCalledWith('login');
    });
  });
});
