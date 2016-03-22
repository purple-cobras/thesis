var db = require('../db');

exports.up = function(knex, Promise) {
  return db.knex.schema.hasTable('saved_responses')
  .then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('saved_responses', function (saved_response) {
        saved_response.increments();
        saved_response.integer('user_id').unsigned().references('id').inTable('users').index();
        saved_response.integer('response_id').unsigned().references('id').inTable('responses').index();
      })
      .then(function (table) {
        console.log('created saved_responses table');
      });
    }
  });
};

exports.down = function(knex, Promise) {
  return db.knex.schema.hasTable('saved_responses')
  .then(function (exists) {
    if (exists) {
      return db.knex.schema.dropTable('saved_responses')
      .then(function (table) {
        console.log('dropped saved_responses table');
      });
    }
  });
};
