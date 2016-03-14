var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_games', function (user_game) {
      user_game.integer('score').defaultTo(0);
      console.log('added score column to users_games');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_games', function (user_game) {
      user_game.dropColumn('score');
      console.log('removed score column from users_games');
    })
  ]);
};
