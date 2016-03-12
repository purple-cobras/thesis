var Knex = require('knex');
var Bookshelf = require('bookshelf');
var env = require('node-env-file');
var path = require('path');
var Promise = require('bluebird');
var db = require('./testdb.js');

// Table creation functions: 

var createGames = function () {
  return db.knex.schema.hasTable('games')
  .then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('games', function (game) {
        game.increments();
        game.string('name', 255);
      })
      .then(function (table) {
        console.log('created games');
      })
      .catch(function (err) {
        console.error('games',err);
      });
    } else {
      return new Promise(function (res, rej) {
        res();
      });
    }
  });
};

var createUsers = function () {
  return db.knex.schema.hasTable('users')
  .then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('users', function (user) {
        user.increments();
        user.string('username', 255).index().unique();
        user.string('full_name', 255);
        user.string('facebook_id', 255).index().unique();
        user.string('pic_url', 255);
        user.integer('current_game_id').unsigned().references('id').inTable('games').index();
      })
      .then(function (table) {
        console.log('created users');
      })
      .catch(function (error) {
        console.error('users',error);
      })
    } else {
      return new Promise(function (res, rej) {
        res();
      });
    }
  });
};

var createRounds = function () {
  return db.knex.schema.hasTable('rounds')
  .then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('rounds', function (round) {
        round.increments();
        round.string('topic', 255);
        round.integer('game_id').unsigned().references('id').inTable('games').index();
        round.integer('reader_id').unsigned().references('id').inTable('users').index();
      })
      .then(function (table) {
        console.log('created rounds table');
      })
      .catch(function (err) {
        console.error('rounds',err);
      });
    } else {
      return new Promise(function (res, rej) {
        res();
      });
    }
  });
  
};

var createResponses = function () {
  return db.knex.schema.hasTable('responses')
  .then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('responses', function (response) {
        response.increments();
        response.string('text', 255);
        response.integer('user_id').unsigned().references('id').inTable('users').index();
        response.integer('round_id').unsigned().references('id').inTable('rounds').index();
      })
      .then(function (table) {
        console.log('created responses table');
      })
      .catch(function (err) {
        console.error('responses',err);
      });
    } else {
      return new Promise(function (res, rej) {
        res();
      });
    }
  });
};

var createUsersGames = function () {
  return db.knex.schema.hasTable('users_games')
  .then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('users_games', function (user_game) {
        user_game.integer('user_id').unsigned().references('id').inTable('users').index();
        user_game.integer('game_id').unsigned().references('id').inTable('games').index();
      })
      .then(function (table) {
        console.log('created users_games table');
      })
      .catch(function (err) {
        console.error('users_games',err);
      });
    } else {
      return new Promise(function (res, rej) {
        res();
      });
    }
  });
};



module.exports = [createGames, createUsers, createRounds, createResponses, createUsersGames];