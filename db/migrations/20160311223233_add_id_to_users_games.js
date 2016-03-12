var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_games', function (user_game) {
      user_game.increments('id').primary();
      console.log('added id column to users_games');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_games', function (user_game) {
      user_game.dropColumn('id');
      console.log('removed id column from users_games');
    })
  ]);
};
