var helpers = require('../db/helpers');

var online = {};
var index = {};

module.exports.init = function(server){
  //TODO:1 - ON DC AND RECONNECTION ADD TO ONLINE FROM MAIN CLIENT PAGE
  var io = require('socket.io')(server);

  io.on('connection', function (socket) {
    //TODO:1 - socket emit checkAuth to add a user that goes straight to main page

    socket.on('login', function (userInfo) {
      markConnected(userInfo);
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

    socket.on('establish', function (userInfo) {
      markConnected(userInfo);
    });

    socket.on('disconnect', function () {
      //TODO: make this less performance intensive
      var user_id = index[socket.id];
      delete online[user_id];
      delete index[socket.id];

    });

    socket.on('room', function (game_id) {
      socket.join('game:' + game_id);
    });

    var markConnected = function (userInfo) {
      online[userInfo.id] = {
        socket_id: socket.id,
        user_id: userInfo.id,
        loginTime: new Date()
      }
      index[socket.id] = userInfo.id;
    };

    /** Invitations **/
    module.exports.inviteFriend = function (user_id) {
      if (!online[user_id]) {
        return;
      }
      io.to(online[user_id].socket_id).emit('invited');
    };

    module.exports.inviteResult = function (players, result) {
      players.forEach(function (player) {
        if (!online[player.id]) {
          return;
        }
        io.to(online[player.id].socket_id).emit('invite response');
      });
    };

    module.exports.gameStarted = function (game_id) {
      io.sockets.in('game:' + game_id).emit('start');
    };

  });

};

