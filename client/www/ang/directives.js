angular.module('app.directives', [])

.directive('fbThumbnail', function(Facebook, store){
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      if (!$scope.friend || !$scope.friend.id) {
        return;
      }
      Facebook.api('/' + $scope.friend.id + '/picture' + 
          '?access_token=' + 
          store.get('fb_access_token') +
          '&type=normal',
        function (response) {
          if (!response.error) {
            element.append('<img src="' + response.data.url + '"></img>');
          }
        }
      );

    }
  }
})

.directive('selectOnClick', ['$window', function ($window) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('click', function () {
          if (!$window.getSelection().toString()) {
              // Required for mobile Safari
              this.setSelectionRange(0, this.value.length)
          }
      });
    }
  };
}])

.directive('endGame', function (socket, $state) {
  return {
    restrict: 'E',
    template: '<button ng-disabled="!Game.started" ng-if="Game.isCreator" class="button button-block button-assertive">End Game</button>',
    link: function (scope, element, attrs) {
      element.on('click', function () {
        if (scope.Game.started) {
          socket.emit('endGame', scope.Game.game.id);
        }
      });
    }
  }
});
