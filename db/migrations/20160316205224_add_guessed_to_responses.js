var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('responses', function (response) {
      response.boolean('guessed').defaultsTo(false);
      console.log('added guessed column to responses');
    })
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('responses', function (response) {
      response.dropColumn('guessed');
      console.log('removed guessed column from responses');
    })
  ]);
};
