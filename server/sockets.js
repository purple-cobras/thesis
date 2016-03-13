var helpers = require('../db/helpers');

var online = {};

module.exports = function(server){
  //TODO:1 - ON DC AND RECONNECTION ADD TO ONLINE FROM MAIN CLIENT PAGE
  var io = require('socket.io')(server);

  io.on('connection', function (socket) {
    console.log('Socket to me');

    //TODO:1 - socket emit checkAuth to add a user that goes straight to main page

    socket.on('login', function (userInfo) {
      online[userInfo.user_fb] = {
        socket_id: socket.id,
        user_fb: userInfo.user_fb,
        name: userInfo.name,
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
      if (online[invitationInfo.invitation.creator.facebook_id]) {
        io.to(online[invitationInfo.invitation.creator.facebook_id].socket_id).emit('inviteAccepted');
      }
    });

    socket.on('declineInvite', function (invitationInfo) {
      if (online[invitationInfo.invitation.creator.facebook_id]) {
        io.to(online[invitationInfo.invitation.creator.facebook_id].socket_id).emit('inviteDeclined');
      }
    });

    socket.on('logout', function (user_fb) {
      if (online[user_fb]) {
        console.log('BEFORE LOGOUT', online);
        delete online[user_fb];
        console.log('AFTER LOGOUT', online);
      }
    });

    socket.on('disconnect', function () {
      console.log('BEFORE DC', online);
      for (var connection in online) {
        if (online[connection].socket_id === socket.id) {
          delete online[connection];
        }
      }
      console.log('AFTER DC', online);
    });
  });
}