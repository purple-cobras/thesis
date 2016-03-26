var path = require('path');
var helpers = require('../db/helpers');
var models = require('../db/models');
var apn = require('apn');
var push = require(path.resolve('server/push'));
var online = {};
var index = {};

module.exports.init = function(server){

  var io = require('socket.io')(server);

  io.on('connection', function (socket) {

    //TODO: send push notification when YOU are the guesser

    socket.on('login', function (userInfo) {
      markConnected(userInfo);
    });

    socket.on('gameCreated', function (gameInfo) {
      for(var friend in gameInfo.friends) {
        if (online[friend]) {
          for (var i = 0; i < online[friend].length; i++) {
            io.to(online[friend][i].socket_id).emit('invite', gameInfo.invitedBy);
          }
        }
      }
    });

    socket.on('logout', function (user_id) {
      delete online[user_id];
    });

    socket.on('establish', function (userInfo) {
      markConnected(userInfo);
    });

    socket.on('disconnect', function () {
      //TODO: make this less performance intensive
      var user_id = index[socket.id];
      if (!online[user_id]) {
        return;
      }
      for (var i = 0; i < online[user_id].length; i++) {
        if (online[user_id][i] && online[user_id][i].socket_id === socket.id) {
          online[user_id].splice(i, 1);
          break;
        }
      }
      delete index[socket.id];

    });

    socket.on('room', function (game_id) {
      socket.join('game:' + game_id);
    });

    socket.on('endGame', function (game_id) {
      helpers.endGame(game_id);
    });

    socket.on('retrieve saved', function (user_id) {
      helpers.getSaved(user_id)
      .then(function (saved_topics) {
        socket.emit('topics retrieved', saved_topics);
      });
    });

    var markConnected = function (userInfo) {
      if (!online[userInfo.id]) {
        online[userInfo.id] = [];
      }
      online[userInfo.id].push({
        socket_id: socket.id,
        user_id: userInfo.id,
        loginTime: new Date()
      });
      index[socket.id] = userInfo.id;
    };

    /** Invitations **/
    module.exports.inviteFriend = function (user_id) {
      if (online[user_id]) {
        for (var i = 0; i < online[user_id].length; i++) {
          io.to(online[user_id][i].socket_id).emit('invited');
        }
      }
      push.user(user_id, 'You have been invited to a game.');
    };

    module.exports.inviteResult = function (players, result, game) {
      if (game) {
        io.sockets.in('game:' + game.get('id')).emit('invite response');
      } else {
        players.forEach(function (player) {
          if (!online[player.id]) {
            return;
          }
          for (var i = 0; i < online[player.id].length; i++) {
            io.to(online[player.id][i].socket_id).emit('invite response');
          }
        });
      }

    };

    module.exports.gameStarted = function (game_id) {
      io.sockets.in('game:' + game_id).emit('start');
      push.game(game_id, 'The game has started.');
    };

    module.exports.newRound = function (game_id, round) {
      var polishedRound = round.attributes;
      polishedRound.reader_name = round.relations.reader.attributes.full_name;
      io.sockets.in('game:' + game_id).emit('scrollTop');
      io.sockets.in('game:' + game_id).emit('round', polishedRound);
      models.Game.forge({id: game_id}).fetch({withRelated: ['rounds']})
      .then(function (game) {
        if (game.relations.rounds.length > 1) {
          push.game(game_id, 'The next round is beginning!');          
        }
      });
    };

    module.exports.newTopic = function (round, topic) {
      models.Game.forge({id: round.attributes.game_id}).fetch()
      .then(function (game) {
        io.sockets.in('game:' + game.attributes.id).emit('topic', topic);
        push.game(game.get('id'), 'The topic has been set!');
      })
      .catch(function (error) {
        console.log('new topic error:', error);
      });
    };

    module.exports.newResponse = function (round_id, response) {
      models.Round.forge({id: round_id}).fetch()
      .then(function (round) {
        models.Game.forge({id: round.attributes.game_id}).fetch()
        .then(function (game) {
          io.sockets.in('game:' + game.attributes.id).emit('response', response);
        })
      })
    };

    module.exports.newGuesser = function (game_id, player) {
      io.sockets.in('game:' + game_id).emit('guesser', player);
    };

    module.exports.newGuess = function (round, guess) {
      models.Game.forge({id: round.get('game_id')}).fetch()
      .then(function (game) {
        io.sockets.in('game:' + game.get('id')).emit('guess', guess);
      });
    };

    module.exports.refreshInvites = function (user_ids) {
      user_ids.forEach( function (user_id) {
        if (online[user_id]) {
          online[user_id].forEach( function (instance) {
            io.to(instance.socket_id).emit('refreshInvites');
          });
        }
      });
    };

    module.exports.revealResponse = function (game_id, response_id) {
      io.sockets.in('game:' + game_id).emit('reveal', response_id);
    };

    module.exports.endGame = function (game_id) {
      io.sockets.in('game:' + game_id).emit('endGame');
    };

    module.exports.nobodyLikesYou = function (friendless_id) {
      if (online[friendless_id]) {
        online[friendless_id].forEach( function (instance) {
          io.to(instance.socket_id).emit('nobodyLikesYou');
        });
      }
      push.user(friendless_id, 'No one wanted to play with you.');
    };
  });
};
