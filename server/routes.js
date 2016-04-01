var path = require('path');
var public = path.resolve('client/www');
var url = require('url');
var expressjwt = require('express-jwt');
var helpers = require(path.resolve('db/helpers'));
var models = require(path.resolve('db/models'));
var jwt = require('jsonwebtoken');
var env = require('node-env-file');


// Reads in .env variables if available
if (process.env.NODE_ENV !== 'production') {
  env(path.resolve('./.env'));
}

var jwtCheck = expressjwt({
  secret: new Buffer(process.env.AUTH_SECRET, 'base64'),
  audience: process.env.AUTH_ID
});

var authRoutes = [
  '/users',
  '/profile',
  '/invitations',
  '/signin',
  '/games',
  '/games/:id/start',
  '/rounds',
  '/rounds/:id/response',
  '/responses/reveal'
];

var routes = [
  {
    path: '/users',
    post: function (req, res) {
      // Store new user data in db.
    },
  },
  {
    path: '/users/:id',
    get: function (req, res) {
      helpers.findOrCreate(models.User, {'id': req.params.id})
      .then(function (user) {
        res.json({user: user});
      })
      .catch(function (error) {
        console.log('get users error:', error);
        res.sendStatus(500);
      });
    }
  },
  {
    path: '/profile',
    get: function (req, res) {
      // Query db for data we'd display on a profile
        // user's total score from all games, total number of games played
        // list of friends, friend stats

    }
  },
  {
    path: '/signin',
    post: function (req, res) {
      helpers.findOrCreate(models.User, {'facebook_id': req.user.sub.split('|')[1]})
      .then( function (user) {
        user.set('full_name', req.body.name)
        .set('pic_url', req.body.pic_url).save()
        .then(function (user) {
          helpers.getProfile(user.id)
            .then(function (games) {
              if (req.body.device_token) {
                helpers.updateDevice(user.get('id'), req.body.device_token)
                .then(function () {
                  res.json({user: user, games: games});
                });
              } else {
                res.json({user: user, games: games});
              }
            });
        });
      })
      .catch(function (error) {
        console.log('errored');
        res.sendStatus(500);
      });
    }
  },
  {
    path: '/games',
    post: function (req, res) {
      var data = req.body;
      var my_fb_id = req.user.sub.split('|')[1];
      data.friends[my_fb_id] = true;
      helpers.createGame(data, my_fb_id)
      .then(function (game) {
        res.json({game: game});
      })
      .catch(function(error) {
        res.status(500);
        res.json({error: error});
      });
    }
  },
  {
    path: '/games/:id',
    get: function (req, res) {
      helpers.getGame(req.params.id)
      .then(function (result) {
        res.json({results: result});
      })
      .catch(function (error) {
        res.status(500);
        res.send({error: error});
      });
    }
  },
  {
    path: '/games/:id/start',
    post: function (req, res) {
      helpers.startGame(req.params.id)
      .then(function () {
        res.json({started: true});
      })
      .catch(function (error) {
        res.status(500);
        res.json({error: error});
      });
    }
  },
  {
    path: '/rounds/:id/response',
    post: function (req, res) {
      helpers.saveResponse(req.params.id, req.body.text, req.body.user_id)
      .then(function () {
        res.json({submitted: true});
      })
      .catch(function (error) {
        res.status(500);
        console.log('Error in "/rounds/:id/response" path');
        res.json({error: error});
      });
    }
  },
  {
    path: '/rounds/:id/topic',
    post: function (req, res) {
      helpers.setTopic(req.params.id, req.body.topic, req.body.saveTopic)
      .then(function () {
        res.json({submitted: true});
      })
      .catch(function (error) {
        res.status(500);
        res.json({error: error});
      });
    }
  },
  {
    path: '/invitations',
    get: function (req, res) {
      helpers.getInvites(req.user.sub.split('|')[1])
      .then(function (games) {
        res.json({invitations: games});
      })
      .catch(function (error) {
        res.status(500);
        res.json({error: error});
      });
    },
    post: function (req, res) {
      helpers.resolveInvite(req.user.sub.split('|')[1], req.body.invitation, req.body.accept)
      .then(function () {
        res.sendStatus(200);
      })
      .catch(function (error) {
        res.status(500);
        res.json({error: error});
      });
    }
  },
  {
    path: '/rounds/:id/guess',
    post: function (req, res) {
      helpers.resolveGuess(req.params.id, req.body.guess)
      .then(function (correct) {
        res.status(200);
        res.json({result: correct});
      })
      .catch(function (error) {
        res.status(500);
        res.json({error: error});
      });
    }
  },
  {
    path: '/responses/reveal',
    post: function (req, res) {
      helpers.revealResponse(req.body.game_id, req.body.response_id)
      .then(function () {
        res.sendStatus(200);
      })
      .catch(function (error) {
        res.status(500);
        res.json({error: error});
      });
    }
  }
];

module.exports = function (app, express) {

  // require authorization for each route in authRoutes
  authRoutes.forEach(function (route){
    app.use(route, jwtCheck);
  });

  routes.forEach(function (route){
    for (var key in route) {
      if (key === 'path') { continue; }
      app[key](route.path, route[key]);
    }
  });
};
