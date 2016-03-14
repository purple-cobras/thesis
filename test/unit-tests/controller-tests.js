
describe('loginCtrl', function () {
    var $rootScope, $scope, store, $state, stateMock, createController, auth, $ionicHistory, $http, $httpBackend, $controller;


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
        stateMock = jasmine.createSpyObj('$state spy', ['go']);

        createController = function () {
          return $controller('loginCtrl', {
            $rootScope: $rootScope,
            $scope: $scope,
            store: store,
            auth: auth,
            $ionicHistory: $ionicHistory,
            $http: $http,
            $state: stateMock
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

        expect(stateMock.go).toHaveBeenCalledWith();
    });
  });


    it('should have a logout method on the $scope', function () {
        createController();
        expect(typeof $scope.logout).toEqual('function');
    });
});
