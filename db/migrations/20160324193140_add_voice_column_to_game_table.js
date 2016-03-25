var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.boolean('voice').defaultsTo(true);
      console.log('added voice column to games');
    })
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('voice');
      console.log('removed voice column from games');
    })
  ]);
};
