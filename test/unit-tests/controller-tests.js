describe('A suite', function () {
    it('contains spec with an expectation', function () {
        expect(true).toBe(true);
    });
});

describe('loginCtrl', function () {
    var scope, loginCtrl;

    beforeEach(module('ui.router'))
    beforeEach(module('app'));
    beforeEach(module('app.login'));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        loginCtrl = $controller('loginCtrl', {$scope:scope});
    }));

    it('should have a login method', function () {
        expect(loginCtrl).toBeDefined();
        expect(scope.login).to.be.a('function');
    });
});