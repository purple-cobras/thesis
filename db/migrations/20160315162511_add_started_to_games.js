var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.boolean('started').defaultTo(false);
      console.log('added started column to users_games');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('started');
      console.log('removed started column from games');
    })
  ]);
};
