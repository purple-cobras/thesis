var Knex = require('knex');
var Bookshelf = require('bookshelf');
var env = require('node-env-file');
var path = require('path');
var inputs = require('./schema').reverse();

if (process.env.NODE_ENV !== 'production') {
  env(path.resolve('.env'));
}

var knex = Knex({
  client: 'postgres',
  connection: process.env.DATABASE_URL || {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'thesis',
    charset: 'utf8'
  }
});

var db = Bookshelf(knex);

var runInput = function (inputs) {
  if (inputs.length) {
    var command = inputs.pop();
    if (typeof command === 'function') {
      command()
      .then(function () {
        runInput(inputs);
      })
      .catch(function (error) {
        console.log('Inputs Error:',error);
      });
    } else {
      runInput(inputs);
    }
  } else {
    knex.migrate.latest({directory: path.resolve('db/migrations')})
    .then(function () {
      console.log('any/all pending migrations complete');
    })
    .catch(function (error) {
      console.error('migration error: ', error);
    });
  }
};

runInput(inputs);

module.exports = db;