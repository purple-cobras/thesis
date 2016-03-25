var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_rounds', function (user_round) {
      user_round.dropColumn('topic_saved');
    }),
    knex.schema.table('rounds', function (round) {
      round.boolean('topic_saved').defaultTo(false).index();
      console.log('moved topic_saved column to rounds');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('rounds', function (round) {
      round.dropColumn('topic_saved');
    }),
    knex.schema.table('users_rounds', function (user_round) {
      user_round.boolean('topic_saved').defaultTo(false).index();
      console.log('moved topic_saved column to users_rounds');
    })
  ]);
};