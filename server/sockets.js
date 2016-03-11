module.exports = function(server){
  var io = require('socket.io')(server);

  io.on('connection', function() {
    console.log('Socket to me');
  });
}