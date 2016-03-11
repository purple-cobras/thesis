angular.module('app.newGame', [])

.controller('newGameCtrl', function ($scope) {

  $scope.inviting = {};
  $scope.rules = {
    maxScore: 15,
    skipIfGuessed: true
  };

  $scope.toggleInvite = function (friend) {
    if($scope.inviting[friend.id]){
      delete $scope.inviting[friend.id];
    } else {
      $scope.inviting[friend.id] = true;
    }
  };


});
