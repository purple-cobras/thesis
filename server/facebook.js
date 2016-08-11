var path = require('path');
var request = require('request');
var env = require('node-env-file');

if (process.env.NODE_ENV !== 'production') {
  env(path.resolve('.env'));
}

var client_id = process.env.AUTH0_MGMT_API_ID;
var client_secret = process.env.AUTH0_MGMT_API_SECRET;

function getFBAccessToken(userId) {

  return authenticateBackendClient()
    .then(extractAuth0Token)
    .then(getFBProfile)
    .then(extractFBToken)
    .catch(handleError);

  function authenticateBackendClient() {
    return new Promise(function(resolve, reject) {
      var options = {
        method: 'POST',
        url: 'https://purplecobras.auth0.com/oauth/token',
        headers: { 'content-type': 'application/json' },
        body: '{"client_id":"' + client_id + '","client_secret":"' + client_secret + '","audience":"https://purplecobras.auth0.com/api/v2/","grant_type":"client_credentials"}'
      };
      request(options, function (error, response, body) {
        if (error) reject(error);
        resolve(body);
      });
    });
  }

  function getFBProfile(auth0MgmtToken) {
    return new Promise(function(resolve, reject) {
      var options = {
        method: 'GET',
        url: 'https://purplecobras.auth0.com/api/v2/users/' + userId,
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + auth0MgmtToken
        }
      };
      request(options, function (error, response, body) {
        if (error) reject(error);
        resolve(body);
      });
    });
  }

  function extractAuth0Token(body) {
    return parseReply(body, 'access_token');
  }

  function extractFBToken(body) {
    var identities = parseReply(body, 'identities');
    return identities[0].access_token;
  }

  function parseReply(str, prop) {
    var obj = JSON.parse(str);
    if (prop !== undefined) return obj[prop];
    return obj;
  }

  function handleError(error) {
    console.log('fb.js error', error)
  }
}

module.exports = getFBAccessToken;
