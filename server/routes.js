var path = require('path');
var public = path.resolve('client/www');
var url = require('url');
var expressjwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var jwtCheck = expressjwt({
  secret: new Buffer(process.env.AUTH_SECRET, 'base64'),
  audience: process.env.AUTH_ID
});

var authRoutes = [];

var routes = [
  {
    path: '/',
    get: function (req, res) {
      res.sendFile(public + '/index.html');
    }
  },
  {
    path: '/games',
    get: function (req, res) {
      //RETURN ALL (CURRENT) GAMES?
    },
    post: function (req, res) {
      //STORE GAME
    }
  },
  {
    path: '/games/:game_id',
    get: function (req, res) {
      //RETURN GAME req.params.game_id
    },
    put: function (req, res) {
      //UPDATE GAME req.params.game_id
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