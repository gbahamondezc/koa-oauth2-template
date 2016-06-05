'use strict';


// @TODO convert this into a npm module

const bluebird = require('bluebird');
const readdir = bluebird.promisify(
  require('readdir-plus')
);

function ThinkyModels(opts) {
  opts = opts || {};
  if (!opts.modelsPath) {
    throw new Error('models path is required!');
  }
  if (!opts.rethink) {
    throw new Error('rethink options are required');
  }
  this.modelsPath = opts.modelsPath;
  this.rethink = opts.rethink;
  this.thinky = require('thinky')(this.rethink);
};

ThinkyModels.prototype.read = function (path) {
  return readdir(path, {
    recursive : false,
    return : 'fullPaths',
    filter : {
      file : /\.(js)$/i
    }
  });
};

ThinkyModels.prototype.getModels = function () {
  return this.read(this.modelsPath)
    .then(files => {
      var models = {};
      var relations = {};
      files.forEach(file => {
        var fnModel = require(file);
        var modelData = fnModel(this.thinky.type);
        models[modelData.tableName] = this.thinky.createModel(
          modelData.tableName,
          modelData.attributes
        );
        if (modelData.relations && modelData.relations.length !== 0) {
          relations[modelData.tableName] = modelData.relations;
        }
      });

      // Making relations
      Object.keys(relations).forEach(key => {
        var tblRels = relations[key];

        // relations : [{
        //   type  : 'hasMany',
        //   model : 'X',
        //   fieldName : 'x',
        //   leftKey : 'xId',
        //   rightKey : 'id',
        //   options : {}
        // }]

        tblRels.forEach(relation => {
          models[key][relation.type](
            models[relation.model],
            relation.fieldName,
            relation.leftKey,
            relation.rightKey,
            relation.options || {}
          );
        });

      });

      return models;
    });
};

module.exports = ThinkyModels;
