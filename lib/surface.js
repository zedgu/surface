/**
 * Surface
 * Copyright 2014 Zed Gu
 * License: MIT
 */
'use strict';

/**
 * Dependencies
 */
var path = require('path');
var kow = require('koa-ovenware');
var debug = require('debug')('surface:debug');

var render = require('./render');
var loader = require('./loader');
var context = require('./context');
var router = require('./router.js');

/**
 * Global
 */
var defaultSetting = {
  root: './lib',
  prefix: false,
  prefixPattern: /^\/api\/v?\d{1,3}(\.\d{1,3}){0,2}/i,
  ctrl: 'controllers',
  model: 'models',
  format: 'json',
  nosniff: true,
  authenticate: false,
  routes: {
    'index': {
      method: 'get',
      path: ''
    },
    'create': {
      method: 'post',
      path: ''
    },
    'get': {
      method: 'get',
      path: '/:id'
    },
    'update': {
      method: 'put',
      path: '/:id'
    },
    'del': {
      method: 'delete',
      path: '/:id'
    }
  },
  aliases: {
    'index': ''
  },
  fields: {
    path: 'request',
    status: 'code',
    message: 'msg',
    data: 'data'
  }
};

/**
 * Expose
 */
module.exports = Surface;

/**
 * Surface Constructor.
 * @param {Object} app     koa().
 * @param {Object} options Config object.
 * @api public
 */
function Surface(app, options) {
  if (!(this instanceof Surface)) {
    return new Surface(app, options);
  }

  this.init(app, options);
}

var surface = Surface.prototype;

surface.init = function(app, options) {
  this.conf = setting(options);
  this.ctrls = loader(this.conf.root, this.conf['ctrl'])
  this.models = loader(this.conf.root, this.conf['model'])

  ctrlFactory(this.ctrls, this.models, this.conf);
  this.routers = router(app, this);

  this.middleware(app);
  context(app, this);

  app.surface = this;
};

function ctrlFactory(ctrls, models, config) {
  for (var file in ctrls) {
    var ctrl = ctrls[file];
    var basename = path.basename(file);
    var alias = typeof ctrl.alias === 'string' ? ctrl.alias : typeof config.aliases[basename] === 'string' ? config.aliases[basename] : basename;

    ctrl.ctrlName = file.replace(new RegExp(basename + '$'), alias).replace(/\/$/, '');
    if (models[file]) {
      ctrl._model = models[file];
    }

    ctrl.model = function (modelName) {
      if (typeof modelName === 'string') {
        return models[modelName.toLowerCase()];
      } else {
        return this._model;
      }
    };
    ctrl.ctrl = function (ctrlName) {
      if (typeof ctrlName === 'string') {
        return ctrls[ctrlName.toLowerCase()];
      } else {
        return this;
      }
    };
  }
}

/**
 * middleware of Surface
 * @return {Generator} middleware for koa
 */
surface.middleware = function(app) {
  var conf = this.conf;
  var fields = this.conf.fields;

  if (conf.nosniff) {
    app.use(function *SurfaceNosniff(next) {
      this.response.set('X-Content-Type-Options', 'nosniff');
      yield next;
    });
  }

  app.use(function *Surface(next) {
    yield next;

    var status = this.res.statusCode;

    if (this.skip_surface) {
      debug('%s : \nNot format by Surface via skip API', this.url);
      return;
    }

    if (conf.prefix && !conf.prefixPattern.test(this.url)) {
      debug('%s : \nNot format by Surface via prefix setting: %s', this.url, conf.prefixPattern);
      return;
    }

    if (status === 204 || status === 205 || status === 304) {
      return;
    }

    render.format(fields, this.body, status, this);
  });
};

/**
 * Set conf
 * @param  {Object} options Options objest
 * @return {Object}         Formated conf object
 * @api private
 */
function setting(options) {
  var conf = {};

  if (options === null || typeof options !== 'object') {
    options = {};
  }

  for (var key in defaultSetting) {
    conf[key] = options[key] === undefined ? defaultSetting[key] : options[key];
  }

  conf.format = render.checkFormat(conf.format, defaultSetting.format);

  if (!options.prefixPattern && typeof conf.prefix === 'string') {
    conf.prefixPattern = new RegExp(conf.prefix);
  }

  if (conf.authenticate) {
    conf.deny = options.deny;
    conf.authenticatePattern = options.authenticatePattern ? options.authenticatePattern : conf.prefixPattern;
    if (conf.authenticate.constructor.name !== 'GeneratorFunction') {
      console.error('authenticate should be a GeneratorFunction');
      conf.authenticate = false;
    }
    if (conf.deny.constructor.name !== 'GeneratorFunction') {
      console.error('deny should be a GeneratorFunction');
    }
  }

  return conf;
};
