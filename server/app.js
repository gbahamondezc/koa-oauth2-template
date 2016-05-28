'use strict';

const path = require('path');
const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const OAuth2Server = require('koa-oauth-server');
const models = require(path.join(__dirname, 'models/all.js'));
const OAuth2Model = require('./oauth2-model.js');
const router = require('koa-load-routes');
const appConfig = require('../config/app.js');
const cors = require('kcors');

// koa instance
var app = new Koa();

// Oauth 2 Server Definition
app.oauth = new OAuth2Server({
  model  : new OAuth2Model(models),
  grants : [
    'password', 'refresh_token',
    'authorization_code', 'extern:auth'
  ],
  debug  : true
});

// Logger and body parse middlewares
app.use(logger());
app.use(bodyParser());
app.use(cors());

// Error handler
app.use(function (ctx, next) {
  return next()
    .catch(function (err) {
      ctx.status = err.status || 500;
      ctx.body   = err.message;
      ctx.app.emit('error', err, ctx);
    });
});

// Public routes
app.use(router({
  path : './server/routes/public.js',
  args : [app.oauth.grant()]
}));

// Private api routes inject models
app.use(router({
  path : './server/routes/api',
  firstMiddleware: app.oauth.authorise(),
  args : [models],
  base : 'api'
}));

// Http server listening
app.listen(appConfig.port, () => {
  console.log(`App started at http://127.0.0.1:${appConfig.port}/`);
});
