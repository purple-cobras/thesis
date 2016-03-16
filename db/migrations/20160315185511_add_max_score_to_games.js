var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.integer('max_score').defaultTo(15);
      console.log('added max_score column to users_games');
    })
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('max_score');
      console.log('removed max_score column from games');
    })
  ]);
};
