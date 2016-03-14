var db = require('./db.js');
var models = require('./models.js');
var Promise = require('bluebird');
var events = require('events');
var eventEmitter = new events.EventEmitter();

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

module.exports.getFriends = function (ids_obj) {
  var ids_array = [];
  for (var id in ids_obj) {
    ids_array.push(id);
  }
  var friends = [];
  var friendCount = 0;
  return new Promise(function (res, rej) {
    return ids_array.forEach(function (id) {
      return db.knex
      .select()
      .from('users')
      .where('facebook_id', id)
      .then(function (user) {
        if (user.length) {
          friends.push(user[0]);
          if (++friendCount === ids_array.length) {
            res(friends);
          }
        } else {
          new models.User({'facebook_id': id}).save()
          .then(function (user) {
            friends.push(user);
            if (++friendCount === ids_array.length) {
              res(friends);
              res();
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

module.exports.inviteFriends = function (game, friends) {
  return new Promise(function (res, rej) {
    var inviteCount = 0;
    friends.forEach(function (friend) {
      module.exports.findOrCreate(models.UserGame, {game_id: game.id, user_id: friend.id})
      .then(function (userGame) {
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
        res(result);
      });
    })
    .catch( function (error) {
      rej(error);
    });
  });
};

module.exports.getGame = function (game_id) {
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
    //.whereNot('users_games.invite', 2)
    //.innerJoin('users', 'users_games.user_id', 'users.id')
    .then(function (players) {
      db.knex.select('rounds.*')
      .from('rounds')
      .where('rounds.game_id', game_id)
      .then(function (rounds) {
        res({players: players, rounds: rounds});
      })
    })
    .catch(function (error) {
      console.log(error);
      rej(error);
    })
  });
};

module.exports.eventEmitter = eventEmitter;