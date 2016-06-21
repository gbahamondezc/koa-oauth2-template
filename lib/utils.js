'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  hashPassword : function(password) {
    return new Promise(function(resolve) {
      bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          throw err;
        }
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            throw err;
          }
          return resolve(hash);
        });
      });
    });
  },

  comparePassword : function(password, userPassword) {
    return new Promise(function(resolve) {
      bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
        if (err) {
          throw err;
        }
        return resolve(isPasswordMatch);
      });
    });
  }
};
