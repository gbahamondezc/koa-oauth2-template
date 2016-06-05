'use strict';

// @TODO convert this into a npm module

const path = require('path');
const bluebird = require('bluebird');
const co = require('co');
const readdir = bluebird.promisify(
  require('readdir-plus')
);

function ServicesLoader(opts) {
  opts = opts || {};
  if (!opts.servicesPath) {
    throw new Error('services path is required!');
  }
  this.servicesPath = opts.servicesPath;

  if (opts.args && opts.args.length !== 0) {
    this.args = [null].concat(opts.args);
  } else {
    this.args = [null];
  }

};

ServicesLoader.prototype.read = function (path) {
  return readdir(path, {
    recursive : false,
    return : 'fullPaths',
    filter : {
      file : /\.(js)$/i
    }
  });
};

ServicesLoader.prototype.getServices = function () {
  return this.read(this.servicesPath)
    .then(files => {
      var services = {};
      files.forEach(file => {
        var serviceName = path.basename(file).replace(/\.[^/.]+$/, '');
        var fnService = require(file);
        this.args.push(co);
        var service = new (fnService.bind.apply(fnService, this.args));
        services[serviceName] = service;
      });
      return services;
    });
};

module.exports = ServicesLoader;
