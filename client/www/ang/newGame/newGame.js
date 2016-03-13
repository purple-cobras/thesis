angular.module('app.newGame', [])

<<<<<<< HEAD
.controller('newGameCtrl', function ($scope, $http, $state, store) {
=======
.controller('newGameCtrl', function ($scope, $http, $state, Sockets) {
>>>>>>> f5be59d... (feat) client side event listeners added in Sockets Factory

  $scope.search = '';
  $scope.isDisabled = false;
  $scope.inviting = {};
  $scope.rules = {
    maxScore: 15,
    skipIfGuessed: true
  };
  $scope.error = '';

  $scope.toggleInvite = function (friend, $event) {
    if($scope.inviting[friend.id]){
      delete $scope.inviting[friend.id];
    } else {
      $scope.inviting[friend.id] = true;
    }
    $event.target.focus();
    var count = Object.keys($scope.inviting).length;
    if (!count) {
      $('.friends-count').text('');
    } else {
      $('.friends-count').text('(' + count + ' invited)');
    }
  };
  $scope.restrictScore = function () {

    if (isNaN ($scope.rules.maxScore) ) {
      $scope.error = 'Please enter numeric value';
      return;
    } else {
      if($scope.rules.maxScore > 50 || $scope.rules.maxScore < 10){
        $scope.error = "Score must be between 10 and 50";
        return;
      }
    }
    $scope.error = '';
  };

  $scope.createGame = function () {
    $scope.isDisabled = true;
    $http({
      url: Config.api + '/games',
      method: 'post',
      data: {
        friends: $scope.inviting,
        rules: $scope.rules,
        creator_id: store.get('remote_id')
      }
    })
    .then(function (response){
      if (response.data.game) {
        $state.go('game');
      } else {
        console.log('something went wrong');
      }
    })
    .catch(function (error) {
        console.log('error', error);
    })
    .finally(function () {
      $scope.isDisabled = false;
    })
  };

});
