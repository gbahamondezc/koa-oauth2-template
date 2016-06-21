const chalk = require('chalk');

module.exports = {
  // Database connection options
  connection : {
    host       : '127.0.0.1',
      dialect  : 'postgres',
      username : 'postgres',
      schema   : 'template_koa',
      password : '',
      port     : 5432
  },

  // Models loading options
  models : {
    autoLoad : true,
    path     : 'server/models'
  },

  // Sequelize options passed directly to Sequelize constructor
  sequelizeOptions : {
    define : {
      freezeTableName : true,
      underscored     : true
    },
    omitNull : true,
    logging  : function(query) {
      var log = chalk.cyan(query.replace('Executing (default): ', ''));
      var prefix = chalk.white.bold('Query => ');
      console.log(prefix, log);
    }
  }
};
