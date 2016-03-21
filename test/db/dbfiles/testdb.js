// var Knex = require('knex');
// var Bookshelf = require('bookshelf');
// var env = require('node-env-file');
// var path = require('path');
//
// if (process.env.NODE_ENV !== 'production' && !process.env.CIRCLECI) {
//   env(__dirname + '../../../../.env');
// }
//
// var knex = Knex({
//   client: 'postgres',
//   connection: {
//     host: 'localhost',
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: 'thesistest',
//     charset: 'utf8'
//   }
// });
//
// var db = Bookshelf(knex);
//
// module.exports = db;
