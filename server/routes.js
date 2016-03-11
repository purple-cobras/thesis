var path = require('path');
var public = path.resolve('client/www');
var url = require('url');
var expressjwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var env = require('node-env-file');

// Reads in .env variables if available
if (process.env.NODE_ENV !== 'production') {
  env(path.resolve('./.env'));
}
x
var jwtCheck = expressjwt({
  secret: new Buffer(process.env.AUTH_SECRET, 'base64'),
  audience: process.env.AUTH_ID
});

var authRoutes = ['/users', '/users/friends', '/games', 'games/invites', '/score/total'];

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
    path: '/users/friends',
    get: function (req, res) {
      // Query db for all of user's friends and their game stats
      // to display rankings, etc
    }
  },
  {
    path: '/games',
    get: function (req, res) {
      // Query db for all user's games.
      // Can be used for displaying total number of games played on profile, etc.
    }
  },
  {
    path: 'games/invites',
    get: function (req, res) {
      // Query db for pending game invitations
      // (Possible) Add invite_status column to users_games table to indicate if 
      // its a game for which the invitation is pending, accepted or declined.
    }
  },
  {
    path: '/score/total', 
    get: function (req, res) {
      // Query db for all user_game scores in order
      // to return a total score to display on a profile, etc.
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