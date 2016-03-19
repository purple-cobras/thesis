var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.boolean('completed').defaultsTo(false);
      console.log('added completed column to games');
    })
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('completed');
      console.log('removed completed column from games');
    })
  ]);
};
