angular.module('app.services', [])

.factory('Game', ['$q', '$http', 'store', 'socket', function($q, $http, store, socket){

  var obj = {
    submitting: false,

    started: false,

    response: '',

    topic: '',

    isReader: false,

    isCreator: false,

    game: {

      id: undefined,

      max_score: undefined,

      //Array of objects, with id, name, guessed, and score
      players: [],

      //Object containing all pertinent info for the round
      current_round: {

        reader: undefined,

        reader_id: undefined,

        //All answers in, ready to start guessing
        ready: false,

        //Array of objects, with id, text, guessed, and user_id
        responses: [

        ],

        //Current round's topic
        topic: ''
      },

      //Array of rounds from the server
      rounds: []
    },

    // The guess a user is going to make
    guess: {
      user: undefined,
      response: undefined
    },

    checkGame: function () {
      var remote_id = store.get('remote_id');
      if (!remote_id) {
        return $q.resolve();
      }
      return $http({
        url: Config.api + '/users/' + remote_id,
        method: 'get'
      })
      .then(function (response) {
        var current_game_id = response.data.user.current_game_id;
        store.set('current_game_id', current_game_id);
        obj.game.id = current_game_id;
        return !!current_game_id;
      })
      .catch(function (error) {
        console.log('check game error', error);
      })
    },

    getGame: function () {
      obj.game.id = store.get('current_game_id');
      if (!obj.game.id) {
        obj.resetGame();
        return $q.resolve();
      }
      return $http({
        url: Config.api + '/games/' + obj.game.id,
        method: 'get'
      })
      .then(function (response) {
        var results = response.data.results;
        obj.game.players = results.players;
        var my_id = store.get('remote_id');
        for (var i = 0; i < obj.game.players.length; i++) {
          if (obj.game.players[i].id === my_id) {
            obj.isCreator = obj.game.players[i].creator ? true : false;
            break;
          }
        }
        obj.rounds = results.rounds;
        obj.started = response.data.results.game.started;
        obj.game.id = response.data.results.game.id;
        obj.game.max_score = response.data.results.game.max_score;
        socket.emit('room', obj.game.id);
      })
      .catch(function (error) {
        console.log(error);
        return error;
      })
    },

    resetGame: function () {
      obj.isReader = false;
      obj.started = false;
      obj.isCreator = false;
      obj.game.players = [];
      obj.rounds = [];
      obj.game.topic = '';
      obj.game.id = undefined;
      obj.game.response = '';
      obj.submitting = false;
      obj.game.currentRound  = {

        max_score: undefined,

        reader: undefined,

        reader_id: undefined,

        //All answers in, ready to start guessing
        ready: false,

        //Array of objects, with id, text, guessed, and user_id
        responses: [

        ],

        //Current round's topic
        topic: ''
      };
      obj.rounds = [];
      obj.response = '';
      obj.current_round = {
        reader_id: undefined,
        ready: false,
        response: []
      }
      obj.guess = {
        user: undefined,
        response: undefined
      }
    },

    updateGame: function  () {
      return obj.checkGame()
      .then(function (hasGame) {
        if (hasGame) {
          return obj.getGame();
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    },

    startGame: function () {
      return $http({
        url: Config.api + '/games/' + obj.game.id + '/start',
        method: 'post'
      })
      .then(function (response) {
        if (response.data.started) {
          obj.started = true;
        }
      })
      .catch(function (error) {
        console.log('starting game error:', error);
      });
    }
  }

  socket.on('invite response', function () {
    obj.getGame();
  });

  socket.on('start', function () {
    obj.started = true;
  });

  return obj;
  
}])

.factory('socket', function (socketFactory) {
  var io_socket = io(Config.api, {'forceNew': true});
  var socket = socketFactory({
    ioSocket: io_socket
  });
  return socket;
})

.factory('Auth', ['auth', 'store', '$state', 'socket', function(auth, store, $state, socket){
  
  var logout = function () {
    auth.signout();
    socket.emit('logout', store.get('remote_id'));
    store.remove('profile');
    store.remove('token');
    store.remove('fb_access_token');
    store.remove('remote_id');
    $state.go('login');
  };

  return {
    logout: logout
  };

}])

.service('BlankService', [function(){

}]);
