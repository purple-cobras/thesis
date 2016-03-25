var apn = require('apn');
var path = require('path');

var options = {
  cert: path.resolve('push/cert.pem'),
  key: path.resolve('push/key.pem')
};
var apnConnection = new apn.Connection(options);



module.exports = apnConnection;