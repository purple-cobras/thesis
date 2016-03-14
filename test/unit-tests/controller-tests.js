
describe('loginCtrl', function () {
    var $rootScope, $scope, store, createController, auth, $ionicHistory, $http, $httpBackend, $controller;


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

        createController = function () {
          return $controller('loginCtrl', {
            $rootScope: $rootScope,
            $scope: $scope,
            store: store,
            auth: auth,
            $ionicHistory: $ionicHistory,
            $http: $http,
          });
        };
    }));

    it('should have a login method on the $scope', function () {
        createController();
        expect($scope.login).toBeDefined();
    });
    it('should have a logout method on the $scope', function () {
        createController();
        expect($scope.logout).toBeDefined();
    });
});
