var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.integer('winner_id').unsigned().references('id').inTable('users');
      console.log('added winner column to games');
    })
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('winner_id');
      console.log('removed winner column from games');
    })
  ]);
};
