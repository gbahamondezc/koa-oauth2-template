module.exports = function(grant) {

  this.post('/oauth/token', grant);

  this.get('/', function(ctx) {
    ctx.body = 'hello world';
  });

};
