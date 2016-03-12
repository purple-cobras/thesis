var Knex = require('knex');
var env = require('node-env-file');
var path = require('path');

if (process.env.NODE_ENV !== 'production') {
  env('../.env');
}

module.exports = {
  client: 'postgres',
  connection: {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'thesis',
    charset: 'utf8'
  },
  migrations: {
    directory: path.resolve('migrations')
  }
};