'use strict';

var utils = require('../../lib/utils.js');


module.exports = function ($models, grant) {


  /*
  * Get a new token
  * */

  this.post('/oauth/token', grant);


  /*
  *  Register a new user
  * */

  this.post('/signup', function *(next) {
    var user = this.request.body;
    var existsByEmail = yield $models.User.filter({
      email : user.email
    });

    if (existsByEmail.length) {
      this.status = 409;
      this.body = {
        field   : 'email',
        message : 'Email ' + this.request.body.email + ' is already in use.'
      };
      return next;
    }

    var existByUsername = yield $models.User.filter({
      username : user.username
    });

    if (existByUsername.length) {
      this.status = 409;
      this.body = {
        field   : 'username',
        message : 'Username ' + this.request.body.username + ' is already in use.'
      };
      return next;
    }

    try {
      user.password = yield utils.hashPassword(user.password);
      var result = yield $models.User.save(user);
      delete user.password;
      this.body = result;
    } catch (ex) {
      this.throw(ex, 500);
    }
  });

};
