'use strict';

module.exports = function($services) {

  this.get('/user/info', function* () {
    var token = this.request.headers.authorization.split(' ')[1];

    var accessToken = yield $services.AccessToken
      .getOneByToken(token);

    var user = yield $services.User
      .getById(accessToken.user_id);

    this.body = {
      email   : user.email,
      locale  : user.locale,
      name    : user.name,
      picture : user.picture
    };
  });


  this.post('/user', function* () {
    var user = yield $services.User.getOneByEmail(this.request.body.email);
    if (!user) {
      this.status = 404;
      this.body   = [];
    }
    this.body = user;
  });
};
