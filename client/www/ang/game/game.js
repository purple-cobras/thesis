angular.module('app.game', [])

.controller('gameCtrl', function($scope, $ionicHistory, $http) {

  $scope.submitting = false;

  $scope.response = '';

  $scope.topic = '';

  $scope.myTopic = '';

  $scope.game = {

    id: undefined,

    //Array of objects, with id, name, guessed, and score
    players: [],

    //Object containing all pertinent info for the round
    current_round: {

      reader_id: undefined,

      //All answers in, ready to start guessing
      ready: false,

      //Array of objects, with id, text, guessed, and user_id
      responses: [

      ]
    },

    //Array of rounds from the server
    rounds: []
  };

  // The guess a user is going to make
  $scope.guess = {
    user: undefined,
    response: undefined
  };

  $scope.back = function () {
    $ionicHistory.goBack(-2);
  };

  $scope.getGame = function () {
    if (!$scope.game.id) {
      return;
    }
    $http({
      url: Config.api + '/games/' + $scope.game.id,
      method: 'get'
    })
    .then(function (response) {
      var results = response.data.results;
      $scope.game.players = results.players;
      $scope.rounds = results.rounds;
    })
    .catch(function (error) {
      console.log(error);
    })
  };

  $scope.getGame();

});