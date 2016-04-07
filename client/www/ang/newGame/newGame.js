angular.module('app.newGame', [])

.controller('newGameCtrl', function (
  $scope, 
  $http, 
  $state, 
  store, 
  Game, 
  $ionicScrollDelegate,
  $ionicPopup
  ) {

  $scope.min_players = Config.min_players || 2;
  $scope.search = '';
  $scope.isDisabled = false;
  $scope.inviting = {};
  $scope.rules = {
    maxScore: 15,
    ai: true,
    skipIfGuessed: true,
    voice: true
  };

  $scope.rulebook = [
    {
      title: 'Skip if guessed',
      body: 'If a player has been guessed out in a round, are they able to guess later in the round?'
    },
    {
      title: 'MambaBot',
      body: 'Whether to include MambaBot, our AI guesser, as a player in this game.'
    },
    {
      title: 'Read Responses',
      body: 'Whether to read all responses aloud. We recommend that you select no if players are not all in the same room.'
    }
  ];

  $scope.error = '';

  $scope.invitedOnly = false;

  $scope.search = {
    friend: ''
  };

  $scope.toggleInvite = function (friend, $event) {
    if($scope.inviting[friend.id]){
      delete $scope.inviting[friend.id];
    } else {
      $scope.inviting[friend.id] = true;
    }
    var count = Object.keys($scope.inviting).length;
    if (!count) {
      $('.friends-count').text('(Invite at least ' + Game.getNumber($scope.min_players - 1 - $scope.Utils.keys($scope.inviting).length) + ')');
    } else if (count < $scope.min_players - 1){
      $('.friends-count').text('(Invite at least ' + Game.getNumber($scope.min_players - 1 - $scope.Utils.keys($scope.inviting).length) + ' more)');
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
    $ionicScrollDelegate.scrollTop(true);
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
      console.dir(error);
        console.log('error', error);
    })
    .finally(function () {
      $scope.isDisabled = false;
    });
  };

  $scope.searchBlur = function () {
    $timeout(function () {
      $scope.searching = false;
    }, 500);
  };

  $scope.displayRules = function () {
    var rulesText = '';
    $scope.rulebook.forEach(function(rule, index) {
      rulesText += '<strong>' + rule.title + ": </strong>" + rule.body;
      if (index !== $scope.rulebook.length - 1) {
        rulesText += '<br>';
      }
    });
    $ionicPopup.show({
      title: "Rulebook",
      template: rulesText,
      scope: $scope,
      buttons: [
        {
          text: "Got it",
          type: 'button button-block button-energized'
        }
      ]
    });
  };

  $('.friends-count').text('(Invite at least ' + Game.getNumber($scope.min_players - 1 - $scope.Utils.keys($scope.inviting).length) + ')');


});
