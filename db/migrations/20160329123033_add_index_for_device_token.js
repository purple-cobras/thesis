var db = require('../db');

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_devices', function (user_device) {
      user_device.dropColumn('device_token');
    }),
    knex.schema.table('users_devices', function (user_device) {
      user_device.string('device_token').index();
      console.log('added index on device_token');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('users_devices', function (user_device) {
      user_device.dropColumn('device_token');
    }),
    knex.schema.table('users_devices', function (user_device) {
      user_device.string('device_token');
      console.log('removed index on device_token');
    })
  ]);
};