var db = require('../db');


exports.up = function(knex, Promise) {
  return knex.schema.table('users_games', function (user_game) {
    user_game.integer('invite');
    console.log('added invite column to users_games');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.tabe('users_games', function (user_game) {
    user_game.dropColumn('invite');
    console.log('removed invite column from users_games');
  });
};
