var env = require('node-env-file');
var path = require('path');
var expect = require('chai').expect;
var db = require('../../../db/db.js');
var schema = require('../../../db/schema.js');
var Knex = require('knex');
var Bookshelf = require('bookshelf');


if (process.env.NODE_ENV !== 'production' && !process.env.CIRCLECI) {
  env(__dirname + '../../../../.env');
}

Knex.knex = Knex.initialize( {
  client : 'postgres',
  connection : {
  host : '127.0.0.1',
  user : 'root',
  password : 'root',
  database : 'testdb',
  charset : 'utf8'
  }
} );


console.log(Knex.knex)
describe('something', function () {
  it('should', function () {
    expect(knex.client).to.equal('postgres')
  });
});
