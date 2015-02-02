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
var util = require('util');
var Kow = require('koa-ovenware');
var debug = require('debug')('surface:debug');

var render = require('./render');
var context = require('./context');

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

  this.conf = setting(options);
  this.load(app, this.conf);

  this.middleware(app);
  context(app, this);
}

var surface = Surface.prototype;

surface.load = function(app, options) {
  var kp = Kow.prototype;
  var conf = this.conf;

  kp.preprocess = function(fn, path) {
    function *authFn(next) {
      if (yield conf.authenticate.bind(this)()) {
        yield fn.bind(this)();
      } else {
        yield conf.deny.bind(this)();
      }
      yield next;
    }

    function *Fn(next) {
      yield fn.bind(this)();
      yield next;
    }

    if (conf.authenticate) {
      if (conf.authenticatePattern) {
        if (conf.authenticatePattern.test(path)) {
          return authFn;
        } else {
          return Fn;
        }
      }
      return authFn;
    }
    return Fn;
  };

  var kow = Kow(app, options);
  this.kow = kow;
  this.ctrls = kow.ctrls;
  this.models = kow.models;
};

/**
 * middleware of Surface
 * @return {Generator} middleware for koa
 */
surface.middleware = function(app) {
  var conf = this.conf;
  var fields = conf.fields;

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
      debug('%s : \nNot format by Surface via skip API', this.path);
      return;
    }

    if (conf.prefix && !conf.prefixPattern.test(this.path)) {
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

  if (typeof conf.prefix === 'string' && !options.prefixPattern) {
    conf.prefixPattern = new RegExp(conf.prefix);
  }

  if (conf.authenticate) {
    conf.deny = options.deny;
    conf.authenticatePattern = options.authenticatePattern || conf.prefixPattern;

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
