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

var authRoutes = ['/users', '/profile', '/invitations', '/signin', '/games'];

var routes = [
  {
    path: '/',
    get: function (req, res) {
      res.sendFile(public + '/index.html');
    }
  },
  {
    path: '/users',
    post: function (req, res) {
      // Store new user data in db.
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
          res.json({user: user});
        })
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
      data.friends[req.user.sub.split('|')[1]] = true;
      helpers.getFriends(data.friends)
      .then(function (friends) {
        new models.Game({creator_id: data.creator_id}).save()
        .then(function (game) {
          helpers.inviteFriends(game, friends)
          .then(function (game) {
            res.json({game: game});
          });
        })
        .catch(function (error) {
          console.log(error);
          res.status(500);
          res.json({error: error});
        })
      })
      .catch(function (error) {
        console.log(error);
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
      })
    }
  },
  {
    path: '*',
    get: function (req, res) {
      res.redirect('/');
    }
  }
];

module.exports = function (app, express) {
  app.use(express.static(public));

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