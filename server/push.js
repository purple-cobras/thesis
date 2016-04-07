var apn = require('apn');
var gcm = require('node-gcm');
var path = require('path');
var env = require('node-env-file');
var models = require(path.resolve('db/models'));

if (process.env.NODE_ENV !== 'production') {
  env(path.resolve('.env'));
}

var sound = 'default';

var options = {
  cert: path.resolve('push/cert.pem'),
  key: path.resolve('push/key.pem')
};

if (process.env.NODE_ENV === 'production') {
  options = {
    cert: path.resolve('push/cert-prd.pem'),
    key: path.resolve('push/key-prd.pem')   
  }
}

var apnConnection = new apn.Connection(options);

var alert = 'Game Update';

var sendToGame = function (game_id, text) {
  models.Game.forge({id: game_id}).fetch({withRelated: ['users']})
  .then(function (game) {
    game.relations.users.forEach(function (player) {
      sendToUser(player.get('id'), text);
    });
  });
};

var sendToUser = function (user_id, text) {
  options = options || {};
  return models.UserDevice.query(function (qb) {
    qb.where('user_id', user_id);
  })
  .fetchAll()
  .then(function (devices) {
    devices.models.forEach(function (device) {
      var token = device.get('device_token');

      try {
        //iOS
        var apnDevice = new apn.Device(token);
        var note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600;
        note.sound = sound;
        note.alert = text;
        apnConnection.pushNotification(note, apnDevice);

        //Android
        var message = new gcm.Message({
          priority: 'high',
          contentAvailable: true,
          delayWhileIdle: true,
          timeToLive: 3,
          notification: {
            title: text,
            body: 'Black Mamba'
          }
        });
        var regTokens = [token];
        var sender = new gcm.Sender(process.env.GCM_API_KEY);
        sender.send(message, {registrationTokens: regTokens});
      }
      // okay to fail silently here. this just means we passed in an Android device token to the apn library
      catch (error) {
        
      }

    });
  });
};

module.exports = {
  user: sendToUser,
  game: sendToGame
};