var db = require('./db.js');
var models = require('./models.js');
var Promise = require('bluebird');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var path = require('path');
var socket = require(path.resolve('server/sockets'));

module.exports.findOrCreate = function (Model, attributes) {

  return new Promise (function (resolve, reject) {
    Model.forge(attributes).fetch()
    .then(function (model) {
      if (!model) {
        model = new Model(attributes);
      }
      model.save()
      .then(function () {
        resolve(model);
      })
      .catch(function (error) {
        reject(error);
      });
    })
    .catch(function (error) {
      reject(error);
    });
  });
};

module.exports.getFriends = function (ids_obj, my_fb_id) {
  var ids_array = [];
  for (var id in ids_obj) {
    ids_array.push(id);
  }
  var friends = [];
  var friendCount = 0;
  var my_id = 0;
  return new Promise(function (res, rej) {
    return ids_array.forEach(function (id) {
      return db.knex
      .select()
      .from('users')
      .where('facebook_id', id)
      .then(function (user) {
        if (id === my_fb_id && user) {
          my_id = user[0].id;
        }
        if (user.length) {
          friends.push(user[0]);
          if (++friendCount === ids_array.length) {
            res({friends: friends, my_id: my_id});
          }
        } else {
          new models.User({'facebook_id': id}).save()
          .then(function (user) {
            friends.push(user);
            if (++friendCount === ids_array.length) {
              res({friends: friends, my_id: my_id});
            }
          })
          .catch(function (error) {
            console.log(error);
          })
        }
      })
    });
  });
};

module.exports.createGame = function (data, my_fb_id) {
  return new Promise(function (res, rej) {
    module.exports.getFriends(data.friends, my_fb_id)
    .then(function (result) {
      new models.Game({
        creator_id: data.creator_id,
        max_score: data.rules.maxScore
      }).save()
      .then(function (game) {
        module.exports.inviteFriends(game, result.friends, result.my_id)
        .then(function (game) {
          models.User.forge({id: game.attributes.creator_id}).fetch()
          .then(function (user) {
            user.set('current_game_id', game.attributes.id)
            .save()
            .then(function (game) {
              res(game);
            })
          })
        });
      })
      .catch(function (error) {
        rej(error);
      })
    });
  });
  
}

module.exports.inviteFriends = function (game, friends, my_id) {
  return new Promise(function (res, rej) {
    var inviteCount = 0;
    friends.forEach(function (friend) {
      var invite = null;
      if (my_id === friend.id) {
        invite = 1;
      }
      module.exports.findOrCreate(models.UserGame, {game_id: game.id, user_id: friend.id, invite: invite})
      .then(function (userGame) {
        socket.inviteFriend(friend.id);
        if (++inviteCount === friends.length) {
          res(game);
        }
      })
      .catch(function (error) {
        rej(error);
      });
    });
  });
};

module.exports.getInvites = function (user_fb) {
  return new Promise(function (res, rej) {
    module.exports.findOrCreate(models.User, {facebook_id: user_fb})
    .then( function (user) {
      db.knex('users_games').where({
        user_id: user.attributes.id,
        invite: null
      }).select('game_id')
      .then(function (userGames) {
        var invitedGames = [];
        userGames.forEach(function (userGame) {
          invitedGames.push(module.exports.findOrCreate(models.Game, {id: userGame.game_id}));
        });
        Promise.all(invitedGames)
        .then(function (games) {
          var creators = [];
          var gameResults = [];
          games.forEach(function (game) {
            gameResults.push(game.attributes);
            creators.push(module.exports.findOrCreate(models.User, {id: game.attributes.creator_id}));
          });
          Promise.all(creators)
          .then(function (creators) {
            var results = [];
            for (var i = 0; i < gameResults.length; i++) {
              var result = {};
              result.id = gameResults[i].id;
              result.name = gameResults[i].name;
              result.creator = creators[i].attributes;
              results.push(result);
            }
            res(results);
          })
          .catch(function (error) {
            console.log(error)
            rej(error);
          });
        });
      });
    });
  });
};

module.exports.resolveInvite = function (user_fb, invitation, accepted) {
  return new Promise(function (res, rej) {
    module.exports.findOrCreate(models.User, {facebook_id: user_fb})
    .then( function (user) {
      var invite;
      if (accepted === true) {
        invite = 1;
      } else {
        invite = 2;
      }
      db.knex('users_games')
      .where({
        user_id: user.id,
        game_id: invitation.id
      })
      .update({
        invite: invite
      })
      .then( function (result) {
        module.exports.getPlayers(invitation.id)
        .then(function (players) {
          socket.inviteResult(players, result);
        });
        if (accepted) {
          user.set('current_game_id', invitation.id).save()
          .then(function () {
            res(result);
          })
          .catch(function (error) {
            rej(error);
          });
        } else {
          res(result);
        }
      });
    })
    .catch( function (error) {
      rej(error);
    });
  });
};

module.exports.getGame = function (game_id) {
  return new Promise(function (res, rej) {
    module.exports.getPlayers(game_id)
    .then(function (players) {
      db.knex.select('rounds.*', 'users.full_name AS reader_name')
      .from('rounds')
      .where('rounds.game_id', game_id)
      .innerJoin('users', 'rounds.reader_id', 'users.id')
      .then(function (rounds) {
        models.Game.forge({id: game_id}).fetch()
        .then(function (game) {
          res({
            players: players, 
            rounds: rounds,
            game: game
          });
        })
      })
    })
    .catch(function (error) {
      console.log(error);
      rej(error);
    });
  });
};

module.exports.getPlayers = function (game_id) {
  return new Promise(function (res, rej) {
    db.knex.select('users.id', 'users.pic_url', 'users.full_name', 'users_games.score')
    .from('users_games')
    .where('users_games.game_id', game_id)
    .innerJoin('games', 'users_games.game_id', 'games.id')
    .innerJoin('users', 'users_games.user_id', 'users.id')
    .groupBy('users.full_name')
    .groupBy('users.id')
    .groupBy('users.pic_url')
    .groupBy('users_games.score')
    .whereNot('users_games.invite', 2)
    .whereNotNull('users_games.invite')
    .then(function (players) {
      models.Game.forge({id: game_id}).fetch()
      .then(function (game) {
        if (!game) {
          return;
        }
        for (var i = 0; i < players.length; i++) {
          if (game.attributes.creator_id === players[i].id) {
            players[i].creator = true;
            break;
          }
        }
        res(players);
      });
    })
    .catch(function (error) {
      rej(error);
    });
  });
}

module.exports.startGame = function (game_id) {
  return new Promise(function (res, rej) {
    models.Game.forge({id: game_id}).fetch()
    .then(function (game) {
      game.set('started', true)
      .save()
      .then(function (game) {
        socket.gameStarted(game_id);
        module.exports.startRound(game_id, game.get('creator_id'));
        res();
      });
    })
    .catch(function (error) {
      console.log(error);
      rej(error);
    })
  });
};

module.exports.startRound = function (game_id, reader_id) {
  return new Promise(function (res, rej) {
    models.Game.forge({id: game_id}).fetch()
    .then(function (game) {
      models.Round.forge({
        game_id: game_id,
        reader_id: reader_id,
        topic: ''
      })
      .save()
      .then(function (round) {
        round.fetch({withRelated: ['reader']})
        .then(function (round) {
          socket.newRound(game_id, round);
          res(round); 
        })
        .catch(function (error) {
          console.log(error);
        })
      });
    })
    .catch(function (error) {
      rej(error);
    })
  });
};

module.exports.setTopic = function (round_id, topic) {
  return new Promise(function (res, rej) {
    module.exports.findOrCreate(models.Round, {id: round_id})
    .then(function (round) {
      round.save({topic: topic})
      .then(function () {
        socket.newTopic(round, topic);
        res();
      })
    })
    .catch(function (error) {
      rej(error);
    })
  });
};

module.exports.saveResponse = function (round_id, response, user_id) {
  return new Promise(function (res, rej) {
    models.Response.forge({
      round_id: round_id, 
      user_id: user_id
    }).fetch()
    .then(function (response) {
      if (response) {
        rej('duplicate');
      } else {
        models.Response.forge({
          round_id: round_id,
          user_id: user_id,
          text: response
        })
        .save()
        .then(function (response) {
          res(response);
        })
      }
    })
    .catch(function (error) {
      rej(error);
    })
  });
};

module.exports.eventEmitter = eventEmitter;