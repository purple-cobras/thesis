var express = require('express');
var app = express();
var server= require('http').Server(app);

var routes = require('./routes.js');

var bodyParser = require('body-parser');
var morgan = require('morgan');
var io = require('./sockets.js');

app.use(bodyParser());
app.use(morgan('dev'));

var port = process.env.PORT || 8080;

server.listen(port, function () {
  console.log('Listening on port ' + port);
});

routes(app, express);

io(server);