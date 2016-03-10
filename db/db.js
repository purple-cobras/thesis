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

// var createGames = function () {
// 	db.knex.schema.hasTable('games')
// 		.then(function (exists) {
// 			if (!exists) {
// 				db.knex.schema.createTable('games', function (game) {
// 					game.increments('id').primary();
// 					game.string('name', 255);
// 				})
// 				.then(function (table) {
// 					console.log('created games table');
// 					createUsers();
// 				})
// 				.catch(function (err) {
// 					console.error(err);
// 				});
// 			} else {
// 				createUsers();
// 			}
// 		});
// };

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

// var createUsers = function () {
// 	db.knex.schema.hasTable('users')
// 	  .then(function (exists) {
// 	  	if (!exists) {
// 	  		db.knex.schema.createTable('users', function (user) {
// 	  			user.increments('id').primary();
// 	  			user.string('username', 255).index().unique();
// 	  			user.string('full_name', 255);
// 	  			user.string('facebook_id', 255).index().unique();
// 	  			user.string('pic_url', 255);
// 	  			user.integer('current_game_id').unsigned().references('id').inTable('games').index();
// 	  		})
// 	  		.then(function (table) {
// 	  			console.log('created users table');
// 	  			createUsersGames();
// 	  		})
// 	  		.catch(function (err) {
// 	  			console.error(err);
// 	  		});
// 	  	} else {
// 	  		createUsersGames();
// 	  	}
// 	  });
// };

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
	})
	.catch(function (err) {
		console.error(err);
});

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


// var createUsersGames = function () {
// 	db.knex.schema.hasTable('users_games')
// 	  .then(function (exists) {
// 	  	if (!exists) {
// 	  		db.knex.schema.createTable('users_games', function (user_game) {
// 	  			user_game.integer('user_id').unsigned().references('id').inTable('users').index();
// 	  			user_game.integer('game_id').unsigned().references('id').inTable('games').index();
// 	  		})
// 	  		.then(function (table) {
// 	  			console.log('created users_games table');
// 	  			createRounds();
// 	  		});
// 	  	} else {
// 	  		createRounds();
// 	  	}
// 	  });
// };

db.knex.schema.createTableIfNotExists('rounds', function (round) {
		round.increments();
		round.string('topic', 255);
		round.integer('game_id').unsigned().references('id').inTable('games').index();
		round.integer('reader_id').unsigned().references('id').inTable('users').index();	
	})
	.then(function (table) {
		console.log('created rounds table:');
	})
	.catch(function (err) {
		console.error(err);
});

// var createRounds = function () {
// 	db.knex.schema.hasTable('rounds')
// 	  .then(function (exists) {
// 	  	if (!exists) {
// 	  		db.knex.schema.createTable('rounds', function (round) {
// 	  			round.increments('id').primary();
// 	  			round.string('topic', 255);
// 	  			round.integer('game_id').unsigned().references('id').inTable('games').index();
// 	  			round.integer('reader_id').unsigned().references('id').inTable('users').index();
// 	  		})
// 	  		.then(function (table) {
// 	  			console.log('created rounds table');
// 	  			createResponses();
// 	  		});
// 	  	} else {
// 	  		createResponses();
// 	  	}
// 	  });
// };

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

// var createResponses = function () {
// 	db.knex.schema.hasTable('responses')
// 	  .then(function (exists) {
// 	  	if (!exists) {
// 	  		db.knex.schema.createTable('response', function (response) {
// 	  			response.increments('id').primary();
// 	  			response.string('text', 255);
// 	  			response.integer('user_id').unsigned().references('id').inTable('users').index();
// 	  			response.integer('round_id').unsigned().references('id').inTable('rounds').index();
// 	  		})
// 	  		.then(function (table) {
// 	  			console.log('created responses table');
// 	  			// createAttributes();
// 	  		});
// 	  	} else {
// 	  		// createAttributes();
// 	  	}
// 	  });
// };

// createGames();

module.exports = db;