
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


    it('should have a login method on the $scope', function () {
        createController();
        expect(typeof $scope.login).toEqual('function');
    });

    it('if successful, should change to state to main', function() {
        createController();
        spyOn($controller, '$scope.login');
        expect($state.go).toHaveBeenCalledWith('main');
    });
  });


    it('should have a logout method on the $scope', function () {
        createController();
        expect(typeof $scope.logout).toEqual('function');
    });
});
