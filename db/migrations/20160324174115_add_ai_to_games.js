var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.boolean('ai').defaultTo(false);
      console.log('added ai column to games');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('ai');
      console.log('removed ai column from games');
    })
  ]);
};