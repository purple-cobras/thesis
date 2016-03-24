var db = require('../db');

var cols = [
  'sentiment',
  'anger',
  'disgust',
  'fear',
  'joy',
  'sadness',
  'art_and_entertainment',
  'automotive_and_vehicles',
  'business_and_industrial',
  'careers',
  'education',
  'family_and_parenting',
  'finance',
  'food_and_drink',
  'health_and_fitness',
  'hobbies_and_interests',
  'home_and_garden',
  'law_govt_and_politics',
  'news',
  'pets',
  'real_estate',
  'religion_and_spirituality',
  'science',
  'shopping',
  'society',
  'sports',
  'style_and_fashion',
  'technology_and_computing',
  'travel'
];

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('responses', function (response) {

      cols.forEach(function(col) {
        response.decimal(col).defaultsTo(0);
      })
      console.log('added alchemy columns to responses');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('responses', function (response) {
      cols.forEach(function (col) {
        response.dropColumn(col);
      })
      console.log('removed alchemy columns from responses');
    })
  ]);
};