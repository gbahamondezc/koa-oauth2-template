module.exports = function($models) {

  this.get('/user/info', function* () {

    var token = this.request.headers.authorization.split(' ')[1];

    var accessToken = yield $models.OAuthAccessToken.filter({
      accessToken : token
    });

    var user = yield $models.User.get(accessToken[0].userId);

    this.body = {
      email  : user.email,
      locale : user.locale,
      name   : user.name,
      picture : user.picture
    };

  });


  this.post('/user', function* () {

    console.log(this.request.body);
    console.log(this.headers);

    var user = yield $models.User.filter({
      email : this.request.body.email
    });

    if (!user.length) {
      this.status = 404;
      this.body = [];
    }

    this.body = user[0];
  });
};
