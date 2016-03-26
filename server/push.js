var apn = require('apn');
var path = require('path');

var options = {
  cert: path.resolve('push/cert.pem'),
  key: path.resolve('push/key.pem')
};
var apnConnection = new apn.Connection(options);



var sendToUser = function (user_id, options) {
  return models.UserDevice.query(function (qb) {
    qb.where('user_id', user_id);
  })
  .fetchAll()
  .then(function (devices) {
    devices.models.forEach(function (device) {
      var apnDevice = new apn.Device(device.get('device_token'));
      var note = new apn.Notification();
      note.expiry = options.expiry || Math.floor(Date.now() / 1000) + 3600;
      note.sound = options.sound || 'default';
      note.alert = options.alert || 'Game Update';
      apnConnection.pushNotification(note, apnDevice);
    });
  });
};

module.exports = sendToUser;