var Knex = require('knex');
var Bookshelf = require('bookshelf');
var env = require('node-env-file');

// Reads in .env variables if available
if (process.env.NODE_ENV !== 'production') {
  env('../.env');
}

var knex = Knex({
	client: 'postgres',
	connection: {
		host: 'localhost',
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: 'thesis',
		charset: 'utf8'
	}
});

var db = Bookshelf(knex);


// Table creation functions: 

var createGames = function () {
	db.knex.schema.createTableIfNotExists('games', function (game) {
		game.increments();
		game.string('name', 255);
	})
	.then(function (table) {
		console.log('created games table');
	})
	.catch(function (err) {
		console.error(err);
	});
};

var createUsers = function () {
	db.knex.schema.createTableIfNotExists('users', function (user) {
		user.increments();
		user.string('username', 255).index().unique();
		user.string('full_name', 255);
		user.string('facebook_id', 255).index().unique();
		user.string('pic_url', 255);
		user.integer('current_game_id').unsigned().references('id').inTable('games').index();
	})
	.then(function (table) {
		console.log('created users table');
		createUsersGames();
	})
	.catch(function (err) {
		console.error(err);
	});
};

var createRounds = function () {
	db.knex.schema.createTableIfNotExists('rounds', function (round) {
		round.increments();
		round.string('topic', 255);
		round.integer('game_id').unsigned().references('id').inTable('games').index();
		round.integer('reader_id').unsigned().references('id').inTable('users').index();	
	})
	.then(function (table) {
		console.log('created rounds table');
	})
	.catch(function (err) {
		console.error(err);
	});
};

var createResponses = function () {
	db.knex.schema.createTableIfNotExists('responses', function (response) {
		response.increments();
		response.string('text', 255);
		response.integer('user_id').unsigned().references('id').inTable('users').index();
		response.integer('round_id').unsigned().references('id').inTable('rounds').index();
	})
	.then(function (table) {
		console.log('craeted responses table');
	})
	.catch(function (err) {
		console.error(err);
	});
};


// Join Tables:

// createUserGames invoked in createUsers .then method
var createUsersGames = function () {
	db.knex.schema.createTableIfNotExists('users_games', function (user_game) {
		user_game.integer('user_id').unsigned().references('id').inTable('users').index();
		user_game.integer('game_id').unsigned().references('id').inTable('games').index();	
	})
	.then(function (table) {
		console.log('created users_games table');
	})
	.catch(function (err) {
		console.error(err);
	});
};


// Invoke table creation functions
createGames();
createUsers();
createRounds();
createResponses();

module.exports = db;