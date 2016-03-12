var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.integer('creator_id').unsigned().references('id').inTable('users');
      console.log('added creator_id to games');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('games', function (game) {
      game.dropColumn('creator_id');
      console.log('removed creator_id from games');
    })
  ]);
};
