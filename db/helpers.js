var db = require('./db.js');
var models = require('./models.js');
var Promise = require('bluebird');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var path = require('path');
var socket = require(path.resolve('server/sockets'));
var alchemy = require(path.resolve('server/alchemy'));
var Networks = require(path.resolve('server/neural'));


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
        max_score: data.rules.maxScore,
        skip_if_guessed: data.rules.skipIfGuessed,
        ai: data.rules.ai,
        voice: data.rules.voice
      }).save()
      .then(function (game) {
        module.exports.inviteFriends(game, result.friends, result.my_id)
        .then(function (game) {
          models.User.forge({id: game.get('creator_id')}).fetch()
          .then(function (user) {
            user.save({current_game_id: game.get('id')})
            .then(function (game) {
              res(game);
            });
          });
        });
      })
      .catch(function (error) {
        rej(error);
      })
    });
  });

};

module.exports.AI = function () {
  return module.exports.findOrCreate(models.User, {ai: true, full_name: 'MambaBot'});
};

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
          if (game.get('ai')) {
            module.exports.AI()
            .then(function (ai) {
              module.exports.findOrCreate(models.UserGame, {game_id: game.id, user_id: ai.get('id'), invite: 1})
              .then(function (model) {
                socket.inviteResult(null, true, game);
              });
            });
          } 
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
      })
      .select('game_id')
      .then(function (userGames) {
        var invitedGames = [];
        for (var i = userGames.length - 1; i >= 0; i--) {
          invitedGames.push(module.exports.findOrCreate(models.Game, {id: userGames[i].game_id}));
        }
        Promise.all(invitedGames)
        .then(function (games) {
          var creators = [];
          var gameResults = [];
          games.forEach(function (game) {
            if (game && game.attributes.creator_id) {
              gameResults.push(game.attributes);
              creators.push(module.exports.findOrCreate(models.User, {id: game.attributes.creator_id}));
            }
          });
          Promise.all(creators)
          .then(function (creators) {
            var results = [];
            for (var i = 0; i < gameResults.length; i++) {
              var result = {};
              result.id = gameResults[i].id;
              result.name = gameResults[i].name;
              result.creator = creators[i].attributes;
              result.created_at = gameResults[i].created_at;
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
        if (result = 1) {
          db.knex('users_games')
          .where({game_id: invitation.id})
          .then(function (invites) {
            models.Game.forge({id: invitation.id}).fetch()
            .then(function (game) {
              var declineCount = game.attributes.ai ? 1 : 0;
              for (var i = 0; i < invites.length; i++) {
                if (invites[i].invite === 2) {
                  declineCount++;
                }
              }
              if (declineCount === invites.length - 1) {
                game.set('completed', true).save();
                models.User.forge({id: game.attributes.creator_id}).fetch()
                .then(function (creator) {
                  creator.set('current_game_id', null).save();
                  socket.nobodyLikesYou(creator.attributes.id);
                })
              }
            })
          });
        }
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
      models.Round.query(function (qb) {
        qb.where('game_id', '=', game_id)
        .orderBy('id', 'desc');
      }).fetchAll({withRelated: ['responses', 'reader', 'guesses']})
      .then(function (rounds) {
        models.Game.forge({id: game_id}).fetch({withRelated: ['guesser', 'winner']})
        .then(function (game) {
          var polishedRounds = [];
          rounds.forEach(function (round) {
            polishedRounds.push(round.attributes);
            polishedRounds[polishedRounds.length - 1].reader_name = round.relations.reader.attributes.full_name;
            var polishedResponses = [];
            round.relations.responses.models.forEach(function (response) {
              polishedResponses.push(response.attributes);
            });
            polishedRounds[polishedRounds.length - 1].responses = polishedResponses;
            var polishedGuesses = {};
            round.relations.guesses.models.forEach(function (guess) {
              polishedGuesses[guess.attributes.user_id] = guess.attributes.guessed;
            });
            polishedRounds[polishedRounds.length - 1].guesses = polishedGuesses;
          });
          if (game.relations.guesser) {
            game.attributes.guesser = game.relations.guesser;
          }
          if (game.relations.winner) {
            game.attributes.winner = game.relations.winner;
          }
          res({
            rounds: polishedRounds,
            players: players,
            game: game
          });
        });
      });
    })
    .catch(function (error) {
      console.log(error);
      rej(error);
    });
  });
};

module.exports.getPlayers = function (game_id) {
  return new Promise(function (res, rej) {
    db.knex.select('users.id', 'users.ai', 'users.pic_url', 'users.full_name', 'users_games.score')
    .from('users_games')
    .where('users_games.game_id', game_id)
    .innerJoin('games', 'users_games.game_id', 'games.id')
    .innerJoin('users', 'users_games.user_id', 'users.id')
    .groupBy('users.full_name')
    .groupBy('users.id')
    .groupBy('users.ai')
    .groupBy('users.pic_url')
    .groupBy('users_games.score')
    .orderBy('users.id', 'desc')
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
        module.exports.getPlayers(game_id)
        .then(function (players) {
          socket.gameStarted(game_id);
          module.exports.startRound(game_id, game.get('creator_id'));
          db.knex('users_games')
          .where('game_id', game_id)
          .whereNull('invite')
          .then( function (usersGames) {
            var playersRejected = [];
            usersGames.forEach(function (userGame) {
              if (userGame.invite === null) {
                playersRejected.push(userGame.user_id);
                models.UserGame.forge({id: userGame.id}).fetch()
                .then( function (ug) {
                  ug.set('invite', 2)
                  .save();
                });
              }
            });
            socket.refreshInvites(playersRejected);
            res();
          });
        });
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
      game.save({guesser_id: null})
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
          });
        });
      });
    })
    .catch(function (error) {
      rej(error);
    })
  });
};

module.exports.setTopic = function (round_id, topic, save) {
  return new Promise(function (res, rej) {
    module.exports.findOrCreate(models.Round, {id: round_id})
    .then(function (round) {
      round.save({topic: topic, topic_saved: save})
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
  var text = response;
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
          text: text
        })
        .save()
        .then(function (response) {
          socket.newResponse(round_id, response);
          models.Round.forge({id: round_id}).fetch({withRelated: ['responses']})
          .then(function (round) {
            module.exports.getPlayers(round.attributes.game_id)
            .then(function (players) {
              if (players.length === round.relations.responses.models.length) {
                  res(response);
              } else {
                res(response);
              }
              module.exports.alchemizeResponse(response);
            })
            .catch(function(error) {
              rej(error);
            })
          })
          .catch(function(error) {
            rej(error);
          })
        })
        .catch(function(error) {
          rej(error);
        })
      }
    })
    .catch(function (error) {
      rej(error);
    })
  });
};

module.exports.setGuesser = function (game_id, players, round) {
  return new Promise(function (res, rej) {
    var guessedIndex = {};
    db.knex('games').where('id', round.attributes.game_id)
    .then(function (game) {
      db.knex('users_rounds').where('round_id', round.attributes.id)
      .then(function (usersRounds) {
        for (var i = 0; i < usersRounds.length; i++) {
          var index;
          for (var j = 0; j < players.length; j++) {
            if (usersRounds[i].user_id === players[j].id) {
              guessedIndex[j] = true;
              break;
            }
          }
        }
        models.Game.forge({id: game_id}).fetch({withRelated: ['guesser']})
        .then(function (game) {
          var readerIndex;
          var newGuesserIndex;
          var currentGuesserIndex;
          for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (game.relations.guesser && player.id === game.relations.guesser.attributes.id) {
              currentGuesserIndex = i;
            }
            if (player.id === round.get('reader_id')) {
              readerIndex = i;
            }
            if (readerIndex !== undefined && (currentGuesserIndex !== undefined || !game.relations.guesser)) {
              break;
            }
          }
          if (game.attributes.skip_if_guessed) {
            if (currentGuesserIndex === undefined) {
              newGuesserIndex = readerIndex + 1;
              if (newGuesserIndex > players.length - 1) {
                newGuesserIndex = 0;
              }
            } else {
              var validGuesser = false;
              newGuesserIndex = currentGuesserIndex;
              while (!validGuesser) {
                newGuesserIndex = (newGuesserIndex + 1) % players.length;
                if (!guessedIndex[newGuesserIndex]) {
                  validGuesser = true;
                }
              }
            }
          } else {
            if (currentGuesserIndex === undefined) {
              newGuesserIndex = readerIndex + 1;
            } else {
              newGuesserIndex = currentGuesserIndex + 1;
            }
            if (newGuesserIndex > players.length - 1) {
              newGuesserIndex = 0;
            }
          }
          var newGuesser = players[newGuesserIndex];
          game.save('guesser_id', newGuesser.id)
          .then(function (game) {
            socket.newGuesser(game_id, newGuesser);
            module.exports.AI()
            .then(function (ai) {
              if (ai.get('id') === newGuesser.id) {
                module.exports.makeAIGuess(game, round);
              }
              res();
            });
          })
        })
        .catch(function (error) {
          console.log('guess', error);
          rej(error);
        });
      });
    });
  });
};

module.exports.setReader = function (game_id, current_round_id, players) {
  return new Promise(function (res, rej) {
    models.Round.forge({id: current_round_id}).fetch({withRelated: ['reader']})
    .then(function (round) {
      var newReaderIndex;
      var currentReaderIndex;
      if (round.relations.reader) {
        for (var i = 0; i < players.length; i++) {
          var player = players[i];
          if (player.id === round.relations.reader.attributes.id) {
            currentReaderIndex = i;
            break;
          }
        }
      }
      if (currentReaderIndex === undefined) {
        newReaderIndex = 1;
      } else {
        if (currentReaderIndex === players.length - 1) {
          newReaderIndex = 0;
        } else {
          newReaderIndex = currentReaderIndex + 1;
        }
      }
      var newReader = players[newReaderIndex];
      module.exports.AI()
      .then(function (ai) {
        if (newReader.id === ai.get('id')) {
          newReaderIndex++;
          if (newReader > players.length - 1) {
            newReaderIndex = 0;
          }
        }
        newReader = players[newReaderIndex];
        round.save('reader_id', newReader.id)
        .then(function (round) {
          res(newReader);
        })
        .catch(function (error) {
          rej(error);
        });
      });
    });
  });
}

module.exports.winGame = function (game, user_id) {
  return new Promise(function (res, rej) {
    game.save({completed: true, winner_id: user_id})
    .then(function (game) {
      var updatedCount = 0;
      models.User.query({where: {current_game_id: game.get('id')}})
      .fetchAll()
      .then(function (users) {
        users.models.forEach(function (user) {
          user.save({current_game_id: null})
          .then(function (user) {
            updatedCount++;
            if (updatedCount === users.models.length) {
              res();
            }
          });
        });
      });
    })
    .catch(function (error) {
      rej(error);
    })
  })
};

module.exports.resolveGuess = function (round_id, guess) {
  return new Promise(function (res, rej) {
    models.Round.forge({id: round_id}).fetch({withRelated: ['responses', 'game']})
    .then(function (round) {
      if (round.relations.game.attributes.guesser_id !== guess.guesser_id) {
        rej({error: 'not your turn'});
        return;
      }
      var correct = round.relations.responses._byId[guess.response_id].attributes.user_id === guess.guessee_id;
      if (correct) {
        module.exports.findOrCreate(models.UserRound, {user_id: guess.guessee_id, round_id: round_id})
        .then(function (userRound) {
          userRound.save({guessed: true})
          .then(function () {
            models.Response.forge({id: guess.response_id}).fetch()
            .then(function (response) {
              response.save({guessed: true})
              .then(function () {
                models.Response.query({where: {round_id: round_id, guessed: false}}).fetchAll({withRelated: ['user']})
                .then(function (responses) {
                  models.UserGame.forge({user_id: guess.guesser_id, game_id: round.get('game_id')}).fetch()
                  .then(function (user_game) {
                    var newRound = responses.models.length === 0 || (responses.models.length === 1 && responses.models[0].get('user_id') === guess.guesser_id);
                    module.exports.AI()
                    .then(function (ai) {
                      if (newRound && guess.guesser_id !== ai.get('id')) {
                        var newScore = user_game.get('score') + 2;
                      } else {
                        var newScore = user_game.get('score') + 1;
                      }
                      user_game.save({score: newScore})
                      .then(function () {
                        var game_id = round.get('game_id');
                        models.Game.forge({id: game_id}).fetch()
                        .then(function (game) {
                          if (game.get('max_score') <= newScore) {
                            module.exports.winGame(game, guess.guesser_id)
                            .then(function () {
                              socket.newGuess(round, {result: correct, details: guess, newRound: newRound, won: true});
                              res(correct);
                            })
                          } else {
                            socket.newGuess(round, {result: correct, details: guess, newRound: newRound});
                            if (newRound) {
                              module.exports.getPlayers(game_id)
                              .then(function (players) {
                                module.exports.setReader(game_id, round_id, players)
                                .then(function (reader) {
                                  module.exports.startRound(game_id, reader.id)
                                  .then(function (round) {
                                    res(correct);
                                  });
                                });
                              });
                            } else {
                              res(correct);
                              models.Round.forge({id: round_id}).fetch()
                              .then(function (round) {
                                if (guess.guesser_id === ai.get('id')) {
                                  module.exports.makeAIGuess(game, round);
                                }
                              });
                            }
                          }
                        });
                      });
                    })
                  });
                });
              });
            });
          });
        });
      } else {
        module.exports.getPlayers(round.get('game_id'))
        .then(function (players) {
          module.exports.setGuesser(round.get('game_id'), players, round)
          .then(function () {
            socket.newGuess(round, {result: correct, details: guess});
            res(correct);
          });
        });
      }
    })
    .catch(function (error) {
      console.log(error);
      rej(error);
    })
  });
};

module.exports.revealResponse = function (game_id, response_id) {
  return new Promise(function (res, rej) {
    models.Response.forge({id: response_id}).fetch()
    .then(function (response) {
      response.save({revealed: true})
      .then(function () {
        socket.revealResponse(game_id, response_id);
        models.Response.query({
          where: {
            round_id: response.get('round_id'),
            revealed: false
          }
        }).fetchAll()
        .then(function (responses) {
          if (!responses.models.length) {
            module.exports.getPlayers(game_id)
            .then(function (players) {
              models.Round.forge({id: response.get('round_id')}).fetch()
              .then(function (round) {
                module.exports.setGuesser(game_id, players, round)
                .then(function () {
                  res();
                });
              });
            });
          } else {
            res();
          }
        });
      });
    })
    .catch(function (error) {
      rej(error);
    })
  });
};

module.exports.eventEmitter = eventEmitter;

module.exports.getGamesWon = function (user_id) {
  return new Promise (function (resolve, reject) {
    db.knex('games')
      .count()
      .where({
        winner_id: user_id
      })
      .then(function (count) {
        resolve(count);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports.getGamesPlayed = function (user_id) {
  return new Promise (function (resolve, reject) {
    db.knex('users_games')
      .count()
      .where({
        user_id: user_id,
        invite: 1
      })
      .then(function (games) {
        resolve(games);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports.getProfile = function (user_id) {
  return new Promise (function (resolve, reject) {
    module.exports.getGamesPlayed(user_id).then(function (played) {
      module.exports.getGamesWon(user_id).then(function (won) {
        resolve({won: won[0].count, played: played[0].count});
      })
      .catch(function (error) {
        reject(error);
      })
    })
    .catch(function (error) {
      reject(error);
    })
  });
};

module.exports.alchemizeResponse = function (response) {
  return new Promise(function (res, rej) {
    alchemy(response.get('text'), {
      success: function (apiResponse, body) {
        if (body["status"] !== "OK") {
          rej({error: body});
        } else {
          alchemyToCols(response, body).save()
          .then(function (response) {
            res(response);
          })
          .catch(function (error) {
            rej(error);
          });
        }
      },
      error: function (error) {
        rej(error);
      }
    });
  })
};

var alchemyToCols = function (response, body) {
  var responseCats = ['docSentiment', 'taxonomy', 'docEmotions'];
  responseCats.forEach(function (category) {
    if (category === 'docSentiment') {
      var score = body[category].score || 0;
      response.set('sentiment', Number(score));
    }
    if (category === 'taxonomy') {
      var tracker = {};
      body[category].forEach(function (tax) {
        var label = tax.label.split('/')[1];
        label = label.split(',').join('');
        label = label.split(' ').join('_');
        if (tracker[label]) {
          return;
        }
        tracker[label] = true;
        response.set(label, Number(tax.score));
      });
    }
    if (category === 'docEmotions') {
      for (var emotion in body[category]) {
        var score = body[category][emotion];
        response.set(emotion, Number(score));
      }
    }
  });

  return response;
};

module.exports.makeAIGuess = function (game, round) {
  var dataCount = 0;
  //Get all players
  var playerCount = 0;
  models.Game.forge({id: game.get('id')}).fetch({withRelated: ['users']})
  .then(function (game) {
    var remainingPlayers = [];
    var players = game.relations.users.models;
    players.forEach(function (player) {
      models.UserRound.forge({user_id: player.get('id'), round_id: round.get('id')}).fetch()
      .then(function (user_round) {
        if (!user_round && !player.get('ai')) {
          remainingPlayers.push(player);
        }
        playerCount++;
        if (playerCount === players.length) {
          console.log('remainingPlayers:', remainingPlayers.length)
          module.exports.AI()
          .then(function (ai) {
            models.Response.query({
              where: {
                round_id: round.get('id'),
                guessed: false
              }
            })
            .fetchAll()
            .then(function (responses) {
              getNnGuess(remainingPlayers, responses).then(function (guess) {
                module.exports.resolveGuess(round.get('id'), {
                  guesser_id: ai.get('id'),
                  guessee_id: guess.player,
                  response_id: guess.response
                });
              });
            });
          });
        }
      });
    });
  });
};

// Queries db for all response from a player
var getPlayerResponses = function (player) {
  return new Promise(function (res, rej) {
    return db.knex
    .select()
    .from('responses')
    .where('user_id', player.id)
    .orderBy('id', 'desc')
    .then(function (responses) {
      res(responses);
    })
    .catch(function (error) {
      console.log('getPlayerResponses error:', error);
    })
  });
};

// Takes a 'sampleSize' number of most recent responses from all players in game.
// Creates attributes object. For each player, player id
// is a key and the value is an array of all alchemy attributes.
var createTrainingData = function (players, sampleSize) {
  sampleSize = sampleSize || 10;
  return new Promise(function (res, rej) {
    var allResponses = [];
    var attributes = {};
    players.forEach(function (player) {
      if (!player.ai) {
        attributes[player.id] = [];
        allResponses.push(getPlayerResponses(player));
      }
    });
    Promise.all(allResponses)
    .then(function (allResponses) {
      allResponses.forEach(function (playerResponses) {
        for (var i = 0; i < sampleSize && i < playerResponses.length; i++) {
          var response = playerResponses[i];
          attributes[response.user_id].push(formatAttributes(response));
        }
      });
      res(attributes);
    })
    .catch(function (error) {
      console.log('createTrainingData error:', error)
    });
  });
};

// Takes a response an returns an array of only alchemy attributes,
// formated for neural network training.
var formatAttributes = function (response) {
  var attributes = [];
  var alchemyAttributes = [
    'anger', 'disgust', 'fear', 'joy', 'sadness', 'art_and_entertainment',
    'automotive_and_vehicles', 'business_and_industrial', 'careers', 'education',
    'family_and_parenting', 'finance', 'food_and_drink', 'health_and_fitness',
    'hobbies_and_interests', 'home_and_garden', 'law_govt_and_politics', 'news',
    'pets', 'real_estate', 'religion_and_spirituality', 'science', 'shopping',
    'society', 'sports', 'style_and_fashion', 'technology_and_computing', 'travel' 
    ];
  var adjustedSentiment = ((1 + Number(response.sentiment)) / 2).toFixed(2);

  attributes.push(Number(adjustedSentiment)); 
  alchemyAttributes.forEach(function (attr) {
    attributes.push(Number(response[attr]));
  });

  return attributes;
};

// Instantiates a collection of neural networks
var initiateNn = function (players) {
  return new Promise(function (res, rej) {
    createTrainingData(players)
    .then(function (attributes) {
      res(new Networks(players, attributes));
    })
    .catch(function (error) {
      console.log('initiateNn error:', error);
    });
  });
};

// Returns player/response guess with highest probability
var getNnGuess = function (players, responses) {
  return new Promise(function (res, rej) {
    initiateNn(players)
    .then(function (neuralNetworks) {
      var bestGuess = {
        probability: -1,
        player: null,
        response: null
      };
      
      players.forEach(function (player) {
        responses.forEach(function (response) {
          var attributes = formatAttributes(response.attributes);
          var probability = neuralNetworks[player.id].network.activate(attributes)[0];
          var guess = {
            probability: probability,
            player: player.attributes.id,
            response: response.attributes.id
          };

          console.log('possible guess:', guess, ' text: ', response.attributes.text);
          if (guess.probability > bestGuess.probability) {
            bestGuess = guess;
          }
        });
      });
      console.log('bestGuess:', bestGuess);
      res(bestGuess);
    })
    .catch(function (error) {
      console.log('getNnGuess error:', error);
    })
    
  });
  return greatest;
};

module.exports.endGame = function (game_id) {
  models.Game.forge({id: game_id})
  .fetch()
  .then(module.exports.winGame)
  .then(function () {
    socket.endGame(game_id);
  });
};

module.exports.getSaved = function (user_id) {
  return new Promise(function (res, rej) {
    models.Round.query(function (qb) {
      qb.where('topic_saved', true)
      .where('reader_id', user_id)
      .limit(50)
      .orderBy('id', 'desc')
    }).fetchAll()
    .then(function (mine) {
      models.Round.query(function (qb) {
        qb.where('topic_saved', true)
        .whereNot('reader_id', user_id)
        .orderBy('id', 'desc')
        .limit(100);
      }).fetchAll()
      .then(function (theirs) {
        res({
          all: theirs.models,
          userTopics: mine.models
        });
      });
    })
    .catch(function (error) {
      rej(error);
    });
  });
};

module.exports.updateDevice = function (user_id, device_token) {
  return module.exports.findOrCreate(models.UserDevice, {device_token: device_token})
  .then(function (device) {
    device.save({user_id: user_id})
    return device;
  });
};
