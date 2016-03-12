var chai = require('chai');
var db = require('./testdb.js');
var models = require('./testModels.js');

var seed = require('./testSeed.js');

seed()
.then(db.knex.select('*').from('users'))
.then(function (user) {
  console.log(user);
  console.log('hi');
});