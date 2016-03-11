module.exports = function () {
  return new Promise(function (resolve, reject) {
    db.knex('users').del()
    .then(function() {
      var user = new models.User({
        'username': '420dongslayer',
        'full_name': 'Noel Felix',
        'facebook_id': 'dqwdqwd',
        'pic_url': 'dwqdqdwq.jpg',
        'current_game_id': null
      });
      user.save().then(resolve());
    });
  });
}