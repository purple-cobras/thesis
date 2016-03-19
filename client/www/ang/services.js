angular.module('app.services', [])

.factory('Game', ['$q', '$http', 'store', 'socket', '$timeout', 'ionicToast', function($q, $http, store, socket, $timeout, ionicToast){

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

      winner: undefined,

      completed: false,

      guesser: undefined,

      //Array of objects, with id, name, guessed, and score
      players: [],

      //Object containing all pertinent info for the round
      current_round: {

        reader_name: undefined,

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
        console.log(response)
        var results = response.data.results;
        obj.game.players = results.players;
        obj.game.guesser = results.game.guesser;
        obj.game.winner = results.game.winner;
        var my_id = store.get('remote_id');
        for (var i = 0; i < obj.game.players.length; i++) {
          if (obj.game.players[i].id === my_id) {
            obj.isCreator = obj.game.players[i].creator ? true : false;
            break;
          }
        }
        obj.game.rounds = results.rounds;
        var lastRound = obj.game.rounds[0];
        if (lastRound && lastRound.reader_id === store.get('remote_id')) {
          obj.isReader = true;
        } else {
          obj.isReader = false;
        }
        obj.game.current_round = lastRound;
        if (obj.game.current_round && obj.game.current_round.responses.length === obj.game.players.length) {
          var randomizedResponses = [];
          for (var i = 0; i < obj.game.players.length; i++) {
            randomizedResponses.push(obj.game.current_round.responses.splice(Math.floor(Math.random() * obj.game.current_round.responses.length), 1)[0]);
          }
          obj.game.current_round.responses = JSON.parse(JSON.stringify(randomizedResponses));
          obj.game.current_round.ready = true;
        }
        obj.game.completed = response.data.results.game.completed;
        obj.started = response.data.results.game.started;
        obj.game.id = response.data.results.game.id;
        obj.game.max_score = response.data.results.game.max_score;
        socket.emit('room', obj.game.id);
      })
      .catch(function (error) {
        return error;
      })
    },

    resetGame: function () {
      obj.isReader = false;
      obj.started = false;
      obj.isCreator = false;
      obj.game.players = [];
      obj.game.rounds = [];
      obj.game.topic = '';
      obj.game.id = undefined;
      obj.game.guesser = undefined;
      obj.game.response = '';
      obj.game.winner = undefined;
      obj.game.completed = false;
      obj.submitting = false;
      obj.game.currentRound  = {

        reader_name: undefined,

        reader_id: undefined,

        //All answers in, ready to start guessing
        ready: false,

        //Array of objects, with id, text, guessed, and user_id
        responses: [

        ],

        //Current round's topic
        topic: ''
      };
      obj.game.rounds = [];
      obj.response = '';
      obj.current_round = {
        max_score: undefined,
        reader_id: undefined,
        reader_name: undefined,
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
    },

    submitTopic: function () {
      var cacheTopic = obj.topic;
      return $http({
        url: Config.api + '/rounds/' + obj.game.current_round.id + '/topic',
        method: 'post',
        data: {topic: obj.topic}
      })
      .then(function (response) {
        if (response.data.submitted) {
          obj.topic = '';
          obj.game.current_round.topic = cacheTopic;
        }
      })
      .catch(function (error) {
        console.log('topic post error:', error);
      })
      .finally(function () {
      });
    },

    submitResponse: function () {
      var cacheResponse = obj.response;
      return $http({
        url: Config.api + '/rounds/' + obj.game.current_round.id + '/response',
        method: 'post',
        data: {
          text: obj.response,
          user_id: store.get('remote_id')
        }
      })
      .then(function (response) {
        if (response.data.submitted) {
          obj.response = '';
        }
      })
      .catch(function (error) {
        console.log('response error: ', error);
      })
      .finally(function () {
      });
    },

    submitGuess: function (guessInfo) {
      guessInfo.guesser_id = store.get('remote_id');
      return $http({
        url: Config.api + '/rounds/' + obj.game.current_round.id + '/guess',
        method: 'POST',
        data: {
          guess: guessInfo
        }
      })
      .then( function (res) {
        obj.guess.user = undefined;
        obj.guess.response = undefined;
        return res;
      })
      .catch( function (error) {
        console.error(error);
      });
    },

    getPlayer: function (id) {
      var player;
      for (var i = 0; i < obj.game.players.length; i++) {
        if (obj.game.players[i].id === id) {
          player = obj.game.players[i];
        }
      }
      return player;
    },

    amGuesser: function () {
      return obj.game.guesser && obj.game.guesser.id === store.get('remote_id');
    }
  }

  socket.on('invite response', function () {
    obj.getGame();
  });

  socket.on('start', function () {
    obj.started = true;
  });

  socket.on('round', function (round) {
    obj.game.rounds.unshift(round);
    if (round.reader_id === store.get('remote_id')) {
      obj.isReader = true;
    } else {
      obj.isReader = false;
    }
    obj.game.guesser = undefined;
    obj.game.current_round = round;
    obj.game.current_round.ready = false;
    obj.game.current_round.topic = '';
  });

  socket.on('topic', function (topic) {
    obj.game.current_round.topic = topic;
  });

  socket.on('response', function (response) {
    var match = undefined;
    if (obj.game.current_round.responses) {
      for (var i = 0; i < obj.game.current_round.responses.length; i++) {
        var checkResponse = obj.game.current_round.responses[i];
        if (response.id === checkResponse) {
          match = checkResponse;
          break;
        }
      }
    } else {
      obj.game.current_round.responses = [];
    }

    if (!match) {
      obj.game.current_round.responses.push(response);
    }

    if (obj.game.current_round && obj.game.current_round.responses.length === obj.game.players.length) {
      var randomizedResponses = [];
      for (var i = 0; i < obj.game.players.length; i++) {
        randomizedResponses.push(obj.game.current_round.responses.splice(Math.floor(Math.random() * obj.game.current_round.responses.length), 1)[0]);
      }
      obj.game.current_round.responses = JSON.parse(JSON.stringify(randomizedResponses));
      obj.game.current_round.ready = true;
    }
  });

  socket.on('guesser', function (guesser) {
    obj.response = '';
    obj.game.guesser = guesser;
  });

  socket.on('guess', function (guess) {
    var guessedResponse;
    var guessee;
    var guesser;
    for (var i = 0; i < obj.game.players.length; i++) {
      var player = obj.game.players[i];
      if (player.id === guess.details.guesser_id) {
        guesser = player;
      }
      if (player.id === guess.details.guessee_id) {
        guessee = player;
      }
      if (guess.result && guess.details.guessee_id === player.id) {
        obj.game.current_round.guesses = obj.game.current_round.guesses || {};
        obj.game.current_round.guesses[player.id] = true;
      }
    }
    for (var i = 0; i < obj.game.current_round.responses.length; i++) {
      var response = obj.game.current_round.responses[i];
      if (response.id === guess.details.response_id) {
        guessedResponse = response;
        if (guess.result) {
          response.guessed = true;
        }
        break;
      }
    }
    if (guess.result) {
      guesser.score = guesser.score + 1;
    }
    var result = guess.result ? 'Correct!' : 'Wrong!'
    if (guess.won) {
      obj.game.winner = guesser;
      obj.game.completed = true;
      result = 'Game Over!'
    }
    var guess_message = guesser.full_name + ' guessed "' + guessedResponse.text + '" was written by ' + guessee.full_name + '. ' + result;
    ionicToast.show(guess_message, 'top', false, 2500);
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
    store.remove('pic_url');
    store.remove('name');
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
