angular.module('app.game', [])

.controller('gameCtrl', function($scope, $ionicHistory) {

  $scope.submitting = false;

  $scope.response = '';

  $scope.topic = '';

  $scope.myTopic = '';

  $scope.game = {

    //Array of objects, with id, name, guessed, and score
    players: [],

    //Object containing all pertinent info for the round
    round: {

      reader_id: undefined

      //All answers in, ready to start guessing
      ready: false,

      //Array of objects, with id, text, guessed, and user_id
      responses: [

      ]
    }
  };

  // The guess a user is going to make
  $scope.guess = {
    user: undefined,
    response: undefined
  };

  $scope.back = function () {
    $ionicHistory.goBack(-2);
  };

});