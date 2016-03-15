var helpers = require('../db/helpers');

var online = {};

module.exports = function(server){
  //TODO:1 - ON DC AND RECONNECTION ADD TO ONLINE FROM MAIN CLIENT PAGE
  var io = require('socket.io')(server);

  io.on('connection', function (socket) {
    console.log('Socket to me');

    //TODO:1 - socket emit checkAuth to add a user that goes straight to main page

    socket.on('login', function (userInfo) {
      online[userInfo.id] = {
        socket_id: socket.id,
        user_id: userInfo.id,
        loginTime: new Date()
      }
    });

    socket.on('gameCreated', function (gameInfo) {
      for(var friend in gameInfo.friends) {
        if (online[friend]) {
          io.to(online[friend].socket_id).emit('invite', gameInfo.invitedBy);
        }
      }
    });

    socket.on('acceptInvite', function (invitationInfo) {
      if (online[invitationInfo.invitation.creator.id]) {
        io.to(online[invitationInfo.invitation.creator.id].socket_id).emit('inviteAccepted');
      }
    });

    socket.on('declineInvite', function (invitationInfo) {
      if (online[invitationInfo.invitation.creator.id]) {
        io.to(online[invitationInfo.invitation.creator.id].socket_id).emit('inviteDeclined');
      }
    });

    socket.on('logout', function (user_id) {
      delete online[user_id];
    });

    socket.on('disconnect', function () {
      //TODO: make this less performance intensive
      for (var connection in online) {
        if (online[connection].socket_id === socket.id) {
          delete online[connection];
        }
      }
    });
  });
}