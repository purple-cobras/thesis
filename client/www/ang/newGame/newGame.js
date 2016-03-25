angular.module('app.newGame', [])

.controller('newGameCtrl', function ($scope, $http, $state, store, Game) {

  $scope.search = '';
  $scope.isDisabled = false;
  $scope.inviting = {};
  $scope.rules = {
    maxScore: 15,
    ai: true,
    skipIfGuessed: true,
    voice: true
  };
  $scope.error = '';

  $scope.invitedOnly = false;

  $scope.search = {friend: ''}

  $scope.toggleInvite = function (friend, $event) {
    if($scope.inviting[friend.id]){
      delete $scope.inviting[friend.id];
    } else {
      $scope.inviting[friend.id] = true;
    }
    var count = Object.keys($scope.inviting).length;
    if (!count) {
      $('.friends-count').text('(Invite at least one friend)');
    } else {
      $('.friends-count').text('(' + count + ' invited)');
    }
    $scope.search.friend = '';
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

  $scope.toggleInvitedFilter = function () {
    $scope.invitedOnly = !$scope.invitedOnly;
  };

  $scope.invited = function (friend) {
    if (!$scope.invitedOnly) {
      return true;
    }
    return $scope.inviting[friend.id];
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
        //SOCKET EMIT gameCreated gameInfo.friend, .invitedBy
        Game.updateGame()
        .then(function () {
          $state.go('game');
        });
      } else {
        console.log('something went wrong');
      }
    })
    .catch(function (error) {
      console.dir(error)
        console.log('error', error);
    })
    .finally(function () {
      $scope.isDisabled = false;
    })
  };

  $scope.searchBlur = function () {
    $timeout(function () {
      $scope.searching = false;
    }, 500);
  };

  $('.friends-count').text('(Invite at least one friend)');


});
