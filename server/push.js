var apn = require('apn');
var gcm = require('node-gcm');
var path = require('path');
var env = require('node-env-file');
var models = require(path.resolve('db/models'));

if (process.env.NODE_ENV !== 'production') {
  env(path.resolve('.env'));
}

var options = {
  cert: path.resolve('push/cert.pem'),
  key: path.resolve('push/key.pem')
};
var apnConnection = new apn.Connection(options);

var alert = 'Game Update';

var sendToUser = function (user_id, options) {
  options = options || {};
  return models.UserDevice.query(function (qb) {
    qb.where('user_id', user_id);
  })
  .fetchAll()
  .then(function (devices) {
    devices.models.forEach(function (device) {
      var token = device.get('device_token');

      //iOS
      var apnDevice = new apn.Device(token);
      var note = new apn.Notification();
      note.expiry = options.expiry || Math.floor(Date.now() / 1000) + 3600;
      note.sound = options.sound || 'default';
      note.alert = options.alert || alert;
      apnConnection.pushNotification(note, apnDevice);

      //Android
      var message = new gcm.Message({
        priority: 'high',
        contentAvailable: true,
        delayWhileIdle: true,
        timeToLive: 3,
        notification: {
          title: alert,
          body: 'Go play!'
        }
      });
      var regTokens = [token];
      var sender = new gcm.Sender(process.env.GCM_API_KEY);
      sender.send(message, {registrationTokens: regTokens});

    });
  });
};

module.exports = sendToUser;