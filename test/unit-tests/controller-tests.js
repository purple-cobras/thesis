
describe('loginCtrl', function () {
    var $rootScope, $scope, store, $state, socket, createController, auth, Auth,$ionicHistory, $http, $httpBackend, $controller;


    beforeEach(module('app'));
    beforeEach(inject(function ($injector) {

        $rootScope = $injector.get('$rootScope');
        $scope = $rootScope.$new();
        store = $injector.get('store');
        auth  = $injector.get('auth');
        $ionicHistory = $injector.get('$ionicHistory');
        $http = $injector.get('$http');
        $httpBackend = $injector.get('$httpBackend');
        $controller = $injector.get('$controller');
        $state = $injector.get('$state');
        Auth = $injector.get('Auth');
        socket = $injector.get('socket');

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
  describe('#login', function() {


    beforeEach(function () {
        createController();
      //  loginCredentials = createFakeLoginCredentials();
    });

    it('should have a login method on the $scope', function () {
        expect($scope.login).toEqual(jasmine.any(Function));
    });

    it('if successful, should change to state to main', function(done) {
        var spy = spyOn($state, 'go')
//$('go', function() {
          expect(spy).toHaveBeenCalledWith('main');
          done();
      //  })
        $scope.login();
    });
  });


    it('should have a logout method on the $scope', function () {
        createController();
        expect($scope.logout).toEqual(jasmine.any(Function));
    });

    it('should call logout() when account is logged out', function () {

    });
});
