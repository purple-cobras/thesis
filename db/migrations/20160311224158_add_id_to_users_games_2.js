var db = require('../db');

exports.up = function(knex, Promise) {
  return knex.schema.table('users_games', function (user_game) {
    
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users_games', function (user_game) {

  });
};
