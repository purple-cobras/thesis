var path = require('path');
var request = require('request');
var env = require('node-env-file');

if (process.env.NODE_ENV !== 'production') {
  env(path.resolve('.env'));
}

var features = ['doc-sentiment', 'doc-emotion', 'taxonomy'];

var api_key = process.env.ALCHEMY_API_KEY;
var base_url = 'http://gateway-a.watsonplatform.net/calls/text/TextGetCombinedData';

var alchemy = function (text, options) {
  url = '';
  url += '?apikey=' + api_key;
  url += '&extract='
  features.forEach(function(feature, index) {
    var comma = index === features.length - 1 ? '' : ',';
    url += encodeURIComponent(feature) + comma;
  });
  url += '&outputMode=json';
  url += '&text=' + encodeURIComponent(text);
  url = base_url + url;
  request(url, function(error, response, body) {
    if (error) {
      if (options.error) {
        options.error(error);
      }
    } else {
      if (options.success) {
        options.success(response, JSON.parse(body));
      }
    }
  })
};

module.exports = alchemy;
