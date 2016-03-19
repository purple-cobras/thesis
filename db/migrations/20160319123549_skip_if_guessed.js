var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.boolean('skip_if_guessed');
      console.log('added skip_if_guessed to games');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('skip_if_guessed');
      console.log('removed skip_if_guessed from games');
    })
  ]);
};
