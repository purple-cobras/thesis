var path = require('path');
var db = require('../../../db/db.js');
var helpers = require('../../../db/helpers.js');
var models = require('../../../db/models');
var env = require('node-env-file');
var socket = require('../../../server/sockets');
var expect = require('chai').expect;


if (process.env.NODE_ENV !== 'production' && !process.env.CIRCLECI) {
  env(__dirname + '../../../../.env');
}



describe('Helper Functions', function () {
  it('should get a games profile', function () {
    helpers.getGamesProfile = function () {
      return new Promise (function (resolve, reject) {
        db.knex.select()
          .from('users_games')
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
  });
  it('should find or create a model', function (done) {
    helpers.findOrCreate = function () {
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
    done();
  });
  it('should return an array of friends ids', function (done) {
    helpers.getFriends = function () {
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
              });
            }
          });
        });
      });
    };
    done();
  });
  it('should create a game', function () {
    helpers.createGame = function () {
      return new Promise(function (res, rej) {
        module.exports.getFriends(data.friends, my_fb_id)
        .then(function (result) {
          new models.Game({
            creator_id: data.creator_id,
            max_score: data.rules.maxScore,
            skip_if_guessed: data.rules.skipIfGuessed
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
                });
              });
            });
          })
          .catch(function (error) {
            rej(error);
          });
        });
      });
    };
  });
  it('should invite friends', function () {
    helpers.inviteFriends = function (game, friends, my_id) {
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
  });
  it('should gather invites', function () {
    helpers.getInvites = function (user_fb) {
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
                  result.created_at = gameResults[i].created_at;
                  results.push(result);
                }
                res(results);
              })
              .catch(function (error) {
                console.log(error);
                rej(error);
              });
            });
          });
        });
      });
    };
  });
  it('should send an invite to another player', function () {
    helpers.resolveInvite = function (user_fb, invitation, accepted) {
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
  });
  it('should get a new game', function () {
    helpers.getGame = function (game_id) {
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
  });
  it('should show players', function () {
    helpers.getPlayers = function (game_id) {
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
    };
  });
  it('should start a game when the game is created', function () {
    helpers.startGame = function (game_id) {
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
        });
      });
    };
  });
  it('should begin the first round', function () {
    helpers.startRound = function (game_id, reader_id) {
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
        });
      });
    };
  });
  it('should create a new topic', function () {
    helpers.setTopic = function (round_id, topic) {
      return new Promise(function (res, rej) {
        module.exports.findOrCreate(models.Round, {id: round_id})
        .then(function (round) {
          round.save({topic: topic})
          .then(function () {
            socket.newTopic(round, topic);
            res();
          });
        })
        .catch(function (error) {
          rej(error);
        });
      });
    };
  });
  it('should save a response', function () {
    helpers.saveResponse = function (round_id, response, user_id) {
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
                });
              });
            })
            .catch(function(error) {
              rej(error);
            });
          }
        })
        .catch(function (error) {
          rej(error);
        });
      });
    };
  });
  it('should say who the guesser is', function () {
    helpers.setGuesser = function (game_id, players, round) {
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
                res();
              });
            })
            .catch(function (error) {
              console.log('guess', error);
              rej(error);
            });
          });
        });
      });
    };
  });
  it('it should show who gets to be the next reader', function () {
    helpers.setReader = function (game_id, current_round_id, players) {
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
          round.save('reader_id', newReader.id)
          .then(function (round) {
            res(newReader);
          })
          .catch(function (error) {
            rej(error);
          });
        });
      });
    };
    it('should a player to win a game', function () {
      helpers.winGame = function (game, user_id) {
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
          });
        });
      };
    });
  });
  it('should allow a player to guess another and show if correct', function () {
    helpers.resolveGuess = function (round_id, guess) {
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
                models.UserGame.forge({user_id: guess.guesser_id, game_id: round.get('game_id')}).fetch()
                .then(function (user_game) {
                  var newScore = user_game.get('score') + 1;
                  user_game.save({score: newScore})
                  .then(function () {
                    models.Response.forge({id: guess.response_id}).fetch()
                    .then(function (response) {
                      response.save({guessed: true})
                      .then(function () {
                        models.Response.query({where: {round_id: round_id, guessed: false}}).fetchAll({withRelated: ['user']})
                        .then(function (responses) {
                          var game_id = round.get('game_id');
                          models.Game.forge({id: game_id}).fetch()
                          .then(function (game) {
                            if (game.get('max_score') <= newScore) {
                              module.exports.winGame(game, guess.guesser_id)
                              .then(function () {
                                socket.newGuess(round, {result: correct, details: guess, won: true});
                                res(correct);
                              });
                            } else {
                              socket.newGuess(round, {result: correct, details: guess});
                              if (responses.models.length === 0 || (responses.models.length === 1 && responses.models[0].get('user_id') === guess.guesser_id)) {
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
                              }
                            }
                          });
                        });
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
        });
      });
    };
  });
   it('should reveal all responses once they are submitted', function () {
    helpers.revealResponse = function (game_id, response_id) {
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
        });
      });
    };
  });
});
