var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('responses', function (response) {
      response.boolean('revealed').defaultTo(false);
      console.log('added revealed column to responses');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('responses', function (response) {
      response.dropColumn('revealed');
      console.log('removed revealed column from responses');
    })
  ]);
};
