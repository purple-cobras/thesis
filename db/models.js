var db = require('./db.js');

var User = db.Model.extend({
  tableName: 'users',
  games: function () {
    return this.hasMany(Game, 'users_games', 'game_id', 'user_id');
  },
  rounds: function () {
    return this.hasMany(Round, 'reader_id');
  },
  responses: function () {
    return this.hasMany(Response, 'user_id');
  },
  currentGame: function () {
    return this.belongsTo(Game, 'current_game_id');
  }
});

var Game = db.Model.extend({
  tableName: 'games',
  users: function () {
    return this.hasMany(User, 'user_id', 'id').through(UserGame, 'game_id', 'user_id');  },
  rounds: function () {
    return this.hasMany(Round, 'game_id');
  },
  responses: function () {
    return this.hasMany(User, 'current_game_id');
  },
  creator: function () {
    return this.belongsTo(User, 'creator_id');
  }
});

var Round = db.Model.extend({
  tableName: 'rounds',
  responses: function () {
    return this.hasMany(Response, 'round_id');
  },
  reader: function () {
    return this.belongsTo(User, 'reader_id');
  },
  game: function () {
    return this.belongsTo(Game, 'game_id');
  }
});

var Response = db.Model.extend({
  tableName: 'responses',
  user: function () {
    return this.belongsTo(User, 'user_id');
  },
  round: function () {
    return this.belongsTo(Round, 'round_id');
  }
});

var UserGame = db.Model.extend({
  tableName: 'users_games',
  user: function () {
    return this.belongsTo(Game, 'game_id');
  },
  game: function () {
    return this.belongsTo(User, 'user_id');
  }
});

var UserRound = db.Model.extend({
  tableName: 'users_rounds',
  user: function () {
    return this.belongsTo(User, 'user_id');
  },
  round: function () {
    return this.belongsTo(Round, 'round_id');
  }
});

module.exports = {
  User: User,
  Game: Game,
  Round: Round,
  Response: Response,
  UserGame: UserGame,
  UserRound: UserRound
};
