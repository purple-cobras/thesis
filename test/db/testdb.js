var Knex = require('knex');
var Bookshelf = require('bookshelf');
var env = require('node-env-file');
var path = require('path');
var inputs = require('./testSchema').reverse();

if (process.env.NODE_ENV !== 'production' && !process.env.CIRCLECI) {
  env(path.resolve('.env'));
}

var knex = Knex({
  client: 'postgres',
  connection: {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'thesistest',
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
    knex.migrate.latest({directory: path.resolve('db/migrations')});
  }
};

runInput(inputs);

module.exports = db;