var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_rounds', function (user_round) {
      user_round.boolean('topic_saved').defaultTo(false);
      console.log('added topic_saved column to users_rounds');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_rounds', function (user_round) {
      user_round.dropColumn('topic_saved');
      console.log('removed topic_saved column from users_rounds');
    })
  ]);
};
