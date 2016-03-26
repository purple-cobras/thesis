var db = require('../db');

exports.up = function(knex, Promise) {
  return db.knex.schema.hasTable('users_devices')
  .then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('users_devices', function (user_device) {
        user_device.increments();
        user_device.integer('user_id').unsigned().references('id').inTable('users').index();
        user_device.string('device_token');
      })
      .then(function (table) {
        console.log('created users_devices table');
      });
    }
  });
};

exports.down = function(knex, Promise) {
  return db.knex.schema.hasTable('users_rounds')
  .then(function (exists) {
    if (exists) {
      return db.knex.schema.dropTable('users_devices')
      .then(function (table) {
        console.log('dropped users_devices table');
      });
    }
  });
};
