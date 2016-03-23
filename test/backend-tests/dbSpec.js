var env = require('node-env-file');
var path = require('path');
var expect = require('chai').expect;
var db = require('../../db/db.js');

if (process.env.NODE_ENV !== 'production' && !process.env.CIRCLECI) {
  env(__dirname + '../../../.env');
}

describe('it should have a connection to the database', function () {
  it('should use a postgres client', function () {
      expect(db.knex.client.config.client).to.equal('postgres');
  });
  it('should have a connection to the databse', function () {
      expect(db.knex.client.config.connection).to.exist
  });
  it('should accept a user', function () {
      expect(db.knex.client.config.connection.user).to.equal('');
  });
  it('should accept a password', function () {
      expect(db.knex.client.config.connection.password).to.equal('');
  });
  it('should connect to the thesis database', function () {
      expect(db.knex.client.config.connection.database).to.equal('thesis');
  });
});
