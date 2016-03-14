
describe('loginCtrl', function () {
    var $rootScope, $scope, store, createController, $state, auth, $ionicHistory, $http, $httpBackend;

    beforeEach(module('app'));
    beforeEach(inject(function ($injector) {

        $rootScope = $injector.get('$rootScope');
        $scope = $rootScope.$new();
        store = $injector.get('store');
        $state = $injector.get('state');
        auth  = $injector.get('auth');
        $ionicHistory = $injector.get('$ionicHistory');
        $http = $injector.get('$http');
        $httpBackend = $injector.get('$httpBackend');

        var $controller = $inject.get('$controller');

        createController = function () {
          return $controller('loginCtrl', {
            $rootScope: $rootScope,
            $scope: $scope,
            store: store,
            $state: $state,
            auth: auth,
            $ionicHistory: $ionicHistory,
            $http: $http,
          });
        };
    }));

    it('should have a login method', function () {
        expect(loginCtrl).toBeDefined();
        expect(scope.login).to.be.a('function');
    });
});
