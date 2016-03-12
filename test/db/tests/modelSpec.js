var expect = require('chai').expect;
var db = require('../dbfiles/testdb.js');
var models = require('../dbfiles/testModels.js');
var inputs = require('../dbfiles/testSchema').reverse();
var path = require('path');

var seed = require('../dbfiles/testSeed.js');

var runInput = function (inputs, cb) {
  if (inputs.length) {
    var command = inputs.pop();
    if (typeof command === 'function') {
      command()
      .then(function () {
        runInput(inputs, cb);
      })
      .catch(function (error) {
        console.log('Inputs Error:',error);
      });
    } else {
      runInput(inputs, cb);
    }
  } else {
    db.knex.migrate.latest({directory: path.resolve('db/migrations')})
    .then(function () {
      cb();
    });
  }
};

var setTables = function (cb) {
  var tableNames = ['games', 'users', 'rounds', 'responses', 'users_games'];
  var tablesCleared = [];
  tableNames.forEach(function (tableName) {
    tablesCleared.push(db.knex(tableName).del());
  });

  var tablesToResetID = ['games', 'users', 'rounds', 'responses'];
  Promise.all(tablesCleared).then(function () {
    var idsReset = [];
    tablesToResetID.forEach(function (tableName) {
      idsReset.push(db.knex.raw("ALTER SEQUENCE " + tableName + "_id_seq RESTART WITH 1"));
    });

    Promise.all(idsReset).then(function () {
      // runInput(inputs, cb);
      cb();
    });
  });
}


// setTables(function () {
  seed(function () {
    db.knex('users')
    .then(function (users) {
      db.knex('games')
      .then(function (games) {
        db.knex('rounds')
        .then(function (rounds) {
          db.knex('responses')
          .then(function (responses) {
            console.log(users);
            console.log(games);
            console.log(rounds);
            console.log(responses);
            db.knex.destroy();
          });
        });
      });
    });
  });
// });

// beforeEach(function (done) {
//   this.timeout(5000);
//   setTables(function () {
//     seed(function () {
//       done();
//     }); 
//   });
// });

// describe('Models', function() {
//   it('Should have access to users', function (done) {
//     db.knex('users')
//     .then(function (users) {
//       expect(users[0].username).to.equal('Richie Cunningham');
//     });
//   });
//   it('Should have access to rounds', function (done) {
//     db.knex('rounds')
//     .then(function (rounds) {
//       expect(rounds[0].game_id).to.equal(2);
//     });
//   });
//   it('Should have access to responses', function (done) {
//     db.knex('responses')
//     .then(function (responses) {
//       expect(responses[0].round_id).to.equal(2);
//     });
//   });
// });
