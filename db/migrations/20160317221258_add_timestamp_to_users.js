var db = require('../db');

exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (user) {
			user.timestamp('created_at').defaultTo(knex.fn.now());
			console.log('added created_at column to users');
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.table('users', function (user) {
			user.dropColumn('created_at');
			console.log('removed created_at column from users');
		})
	]);
};
