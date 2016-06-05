'use strict';

// Modules dependencies
const join         = require('path').join;
const resolve      = require('path').resolve;
const Koa          = require('koa');
const logger       = require('koa-logger');
const cors         = require('kcors');
const bodyParser   = require('koa-bodyparser');
const OAuth2Server = require('koa-oauth-server');
const router       = require('koa-load-routes');

// Config and own libraries
const appConfig      = require(join(resolve(), 'config/app.js'));
const dbConfig       = require(join(resolve(), 'config/database.js'));
const OAuth2Model    = require(join(resolve(), 'lib/oauth2-model.js'));
const ThinkyModels   = require(join(resolve(), 'lib/thinky-models.js'));
const ServicesLoader = require(join(resolve(), 'lib/services-loader.js'));


var thinkyModels = new ThinkyModels({
  modelsPath : join(resolve(), 'server', 'models'),
  rethink    : dbConfig
});


var models = {};

thinkyModels.getModels()
  .then(thinkyModels => {
    models = thinkyModels;
    var serviceLoader  = new ServicesLoader({
      servicesPath : join(resolve(), 'server', 'services'),
      args : [models]
    });
    return serviceLoader.getServices();
  })
  .then(services => {

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
      args : [models, app.oauth.grant()]
    }));

    // Private api routes inject models
    app.use(router({
      path : './server/routes/api',
      firstMiddleware: app.oauth.authorise(),
      args : [services],
      base : 'api'
    }));

    // Http server listening
    app.listen(appConfig.port, () => {
      console.log(`App started at http://127.0.0.1:${appConfig.port}/`);
    });
  });
