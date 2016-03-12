var db = require('../dbfiles/testdb.js');
var models = require('../dbfiles/testModels.js');

module.exports = function (cb) {

  db.knex('users')
  .then(function (users) {
    if (users.length === 0) {

      var def = 'NONUNIQUE';
      var userNames = [
      'Richie Cunningham',
      'Oprah',
      'Number Two',
      'Alotta',
      "Patches O'Houlihan",
      'Steve the Pirate'
      ];

      gameSeeds = [];
      numGames = 2;
      for (var i = 1; i < numGames + 1; i++) {
        var game = new models.Game({
          'name': def + '-' + 'game-' + i
        });
        gameSeeds.push(game.save());
      }

      Promise.all(gameSeeds)
      .then(function () {
        userSeeds = [];
        numUsers = 6;
        for (var i = 1; i < numUsers + 1; i++) {
          var user = new models.User({
            'username': userNames[i-1],
            facebook_id: def + '-' + 'fb-' + i,
            full_name: def + '-' + 'name-' + i,
            pic_url: def + '-' + 'pic-' + i,
            current_game_id: ((i - 1) % numGames) + 1
          });
          userSeeds.push(user.save());
        }

        Promise.all(userSeeds)
        .then(function () {
          roundSeeds = [];
          numRounds = numGames * 2;
          for (var i = 1; i < numRounds + 1; i++) {
            var round = new models.Round({
              'topic': def + '-' + 'topic-' + i,
              'reader_id': ((i - 1) % numUsers) + 1,
              'game_id': ((i - 1) % numGames) + 1
            });
            roundSeeds.push(round.save());
          }

          Promise.all(roundSeeds)
          .then(function () {
            responseSeeds = [];
            numResponses = numRounds * ((numUsers / numGames));
            for (var i = 1; i < numResponses + 1; i++) {
              var response = new models.Response({
                'text': def + '-' + 'text-' + i,
                'user_id': ((i - 1) % numUsers) + 1,
                'round_id': ((i - 1) % numRounds) + 1
              });
              responseSeeds.push(response.save());
            }

            Promise.all(responseSeeds).then(function () {
              cb();
            })
            .catch(function (error) {
              console.log(error);
            });
          })
          .catch(function (error) {
            console.log(error);
          });
        })
        .catch(function (error) {
          console.log(error);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    } else {
      cb();
    }
  })
}