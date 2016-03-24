var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function (user) {
      user.boolean('ai').defaultTo(false).index();
      console.log('added ai column to users');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users', function (user) {
      user.dropColumn('ai');
      console.log('removed ai column from users');
    })
  ]);
};