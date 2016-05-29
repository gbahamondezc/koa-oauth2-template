'use strict';

module.exports = function($models) {
  this.post('/private', function (ctx) {
    console.log(ctx.body);
    console.log(ctx.headers);
    ctx.body = {message : 'private api'};
  });
};
