var db = require('../db');

exports.up = function(knex, Promise) {
  return db.knex.schema.hasTable('users_rounds')
  .then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('users_rounds', function (user_round) {
        user_round.increments();
        user_round.integer('user_id').unsigned().references('id').inTable('users').index();
        user_round.integer('round_id').unsigned().references('id').inTable('rounds').index();
        user_round.boolean('guessed').defaultsTo(false);
      })
      .then(function (table) {
        console.log('created users_rounds table');
      });
    }
  });
};

exports.down = function(knex, Promise) {
  return db.knex.schema.hasTable('users_rounds')
  .then(function (exists) {
    if (exists) {
      return db.knex.schema.dropTable('users_rounds')
      .then(function (table) {
        console.log('dropped users_rounds table');
      });
    }
  });
};
