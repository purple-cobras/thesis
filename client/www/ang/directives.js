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
})

.directive('optionDisplay', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      $(elem).hide();
      scope.$watch('Game.game.current_round', function() {
        if (scope.Game.game.current_round && scope.Game.game.current_round.reader_id === scope.Game.remote_id ) {
          scope.$watch('Game.game.current_round.reader_id', function () {
            if (!scope.Game.game.completed && !scope.Game.game.current_round.topic.length) {
              $(elem).show();
            }
          });
          scope.$watch('Game.game.current_round.topic', function () {
            if (scope.Game.game.current_round.topic.length) {
              $(elem).hide();
            }
          });
        }
      })
    }
  }
})

.directive('topicOptions', function ($ionicPopup, ionicToast) {
  return {
    restrict: 'E',
    template: '<button option-display class="button button-block button-calm " id="topicOptions">Options</button>',
    link: function (scope, elem, attrs) {
      elem.on('click', function () {
        $ionicPopup.show({
          title: "Topic Options",
          scope: scope,
          buttons: [
            {
              text: 'Rand',
              type: 'button button-block button-calm',
              onTap: function (e) {
                if (scope.Game.saved_topics.is_empty) {
                  ionicToast.show("Be the first to save a topic!", 'top', false, 2500);
                } else {
                  scope.getRandomTopic();
                }
              }
            },
            {
              text: 'Save',
              type: 'button button-block button-calm',
              onTap: function (e) {
                ionicToast.show("Will " + scope.toggleSave() + "save round's Topic on Submit", 'top', false, 2500);
              }
            },
            {
              text: 'Load',
              type: 'button button-block button-calm',
              onTap: function (e) {
                if (scope.Game.saved_topics.is_empty || !scope.Game.saved_topics.userTopics.length) {
                  ionicToast.show("You have not saved any Topics", 'top', false, 2500);
                } else {
                  scope.getUsersTopics();
                }
              }
            },
            {
              text: 'Back',
              type: 'button button-block button-calm'
            }
          ]
        })
      });
    }
  }
});
