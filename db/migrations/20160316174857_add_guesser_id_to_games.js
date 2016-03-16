var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.integer('guesser_id').unsigned().references('id').inTable('users');
      console.log('added guesser_id column to users_games');
    })
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('guesser_id');
      console.log('removed guesser_id column from games');
    })
  ]);
};
