var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_games', function (user_game) {
      user_game.timestamp('created_at').defaultTo(knex.fn.now());
      console.log('added created_at column to users_games');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_games', function (user) {
      user.dropColumn('created_at');
      console.log('removed created_at column from users_games');
    })
  ]);
};
