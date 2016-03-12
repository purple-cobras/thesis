var db = require('./db.js');
var models = require('./models.js');
var Promise = require('bluebird');

module.exports.findOrCreate = function (Model, attributes) {

  return new Promise (function (resolve, reject) {
    Model.forge(attributes).fetch()
    .then(function (model) {
      if (!model) {
        model = new Model(attributes);
      }
      model.save()
      .then(function () {
        resolve(model);
      })
      .catch(function (error) {
        reject(error);
      });
    })
    .catch(function (error) {
      reject(error);
    });
  });
};

module.exports.getFriends = function (ids_array) {
  return db.knex
  .select()
  .from('users')
  .whereIn('facebook_id', ids_array)
  .then(function (friends) {
    return friends;
  })
  .catch(function (error) {
    return error;
  })
};