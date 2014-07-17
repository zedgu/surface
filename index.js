/**
 * Surface
 * Copyright 2014 Zed Gu
 * License: MIT
 */
'use strict';

/**
 * Dependencies
 */
var Router = require('koa-router')
  , methods = require('methods')
  , fs = require('fs')
  , path = require('path')
  , js2xmlparser = require("js2xmlparser")
  , router
  ;

/**
 * Expose
 */
module.exports = Surface;

/**
 * Common Functions
 */
function isObject(value) {
  return value != null && typeof value === 'object';
}

/**
 * Surface Constructor.
 * @param {Object} app    koa().
 * @param {Object} option Config object.
 * @api public
 */
function Surface(app, option) {
  if (this instanceof Surface) {
    this._conf = {
      root: './lib',
      ctrl: 'controllers',
      model: 'models',
      format: 'json',
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
          method: 'del',
          path: '/:id'
        }
      },
      aliases: {
        'index': ''
      }
    };
    this._format = ['json', 'xml'];

    this.setting(option);

    this.init();

    app.use(this.api()); // register ctx[x]

    router = new Router(app);
    app.use(router.middleware());
    this.register(app); // register routes

    app.use(this.middleware());
  } else {
    var surface = new Surface(app, option);
    return {
      conf: surface.conf,
      models: surface.models,
      ctrls: surface.ctrls
    };
  }
}

var surface = Surface.prototype;

/**
 * Set conf
 * @param  {Object} option Option objest
 * @return {Object}        Formated conf object
 * @api private
 */
surface.setting = function(option) {
  var _conf = this._conf
    , conf = this.conf = {}
    ;
  if (!isObject(option)) {
    option = {};
  }
  for (var key in _conf) {
    conf[key] = option[key] || _conf[key];
  }

  this.routes = conf.routes;
  conf.format = this.checkFormat(conf.format, _conf.format);

  return conf;
};

surface.init = function() {
  var ctrls = this._ctrls = this.load(path.join(this.conf.root, '/', this.conf['ctrl']))
    , models = this._models = this.load(path.join(this.conf.root, '/', this.conf['model']))
    , C = this.ctrls = {}
    , M = this.models = {}
    , ctrl
    , ctrlName
    , basename
    , alias
    ;

  for (var file in ctrls) {
    ctrl = C[file] = require(ctrls[file]);
    basename = path.basename(file.toLowerCase());

    if (typeof ctrl.alias === 'string') {
      alias = ctrl.alias;
    } else if (typeof this.conf.aliases[basename] === 'string') {
      alias = this.conf.aliases[basename];
    } else {
      alias = basename;
    }
    ctrl.ctrlName = file.toLowerCase().replace(new RegExp(basename + '$'), alias).replace(/\/$/, '');

    if (models[file]) {
      M[file] = ctrl.model = require(models[file]);
    }
  }
};

/**
 * middleware of Surface
 * @return {Generator} middleware for koa
 */
surface.middleware = function() {
  var surface = this;
  return function *Surface(next) {
    var status = this.status;

    this.body = surface.format(this.body, this);
    this.status = surface.status(this.body, status); // keep as original status

    yield next;
  };
};

/**
 * middleware of SurfaceAPI
 * @return {Generator} middleware for koa
 * @api private
 */
surface.api = function() {
  var surface = this;
  return function *SurfaceAPI(next) {
    /**
     * get model object via ctx
     * @param  {String} name model name
     * @return {Object}      model object
     */
    this.model = function(name) {
      name = name || router.match(this.path)[0].route.name;
      return surface.models[name];
    };
    yield next;
  };
};

/**
 * To parse ctx.body to the format which has been set.
 * 
 * @param  {ANY}    data ctx.body
 * @param  {Object} ctx  context object of koa
 * @return {String}      formated data
 * @api private
 */
surface.format = function(data, ctx) {
  var format = this.checkFormat(ctx.query.format);
  if (format === 'xml') {
    ctx.type = 'Content-type: application/xml; charset=utf-8';
  }

  return this[format](ctx.path, ctx.status, ctx.toJSON().response.string, data);
};

surface.status = function(body, status) {
  if (status === 200 && body.data === '') {
    status = 204;
  }
  return status;
};

surface.checkFormat = function(format, _format) {
  if (!_format) {
    _format = this.conf.format;
  }

  if (format) {
    return this._format.indexOf(format.toLowerCase()) === -1 ? _format : format;
  } else {
    return _format;
  }
};
/**
 * JSON Result Format
 * @param  {String} req  String
 * @param  {Number} code HTTP Code
 * @param  {String} msg  String of HTTP Status
 * @param  {Object} data Real data
 * @return {Object}      Formated data
 * @api private
 */
surface.json = function(req, code, msg, data) {
  return {
    request: req,
    code: code,
    message: msg,
    data: data
  };
};

/**
 * XML Result Format
 * @param  {String} req  String
 * @param  {Number} code HTTP Code
 * @param  {String} msg  String of HTTP Status
 * @param  {Object} data Real data
 * @return {String}      String of XML Document
 * @api private
 */
surface.xml = function(req, code, msg, data) {
  var json = this.json(req, code, msg, data)
    ;
  return js2xmlparser('response', json, {
    wrapArray : {
      enabled : false
    },
    prettyPrinting: {
      enabled : false
    }
  });
};

/**
 * register route
 * @param  {Object}   app      koa()
 * @api private
 */
surface.register = function(app) {
  var ctrls = this.ctrls
    , ctrl
    , routes
    ;
  for (var name in ctrls) {
    ctrl = ctrls[name];

    for (var action in ctrl) {

      routes = ctrl.routes || this.routes;

      if (!!routes[action]) {
        app[routes[action].method](name, path.join('/', ctrl.ctrlName, routes[action].path), ctrl[action]);
      }
    }
  }
};

/**
 * to load files
 * @param  {String} root    root path
 * @param  {String} subPath sub dir path
 * @param  {Object} paths   dictionary of the paths
 * @return {Object}         dictionary of the paths
 * @api private
 */
surface.load = function(root, subPath, paths) {
  var dirPath = path.resolve(subPath || root)
    , subPath = subPath ? path.basename(subPath) + '/' : ''
    , paths = paths || {}
    , files
    ;
  try {
    files = fs.readdirSync(dirPath)
  } catch(e) {
    files = [];
  }
  files.forEach(function(file) {
    file = path.join(dirPath, '/', file);
    if (fs.statSync(file).isFile()) {
      if (path.extname(file) === '.js') {
        paths[file.replace(new RegExp('^' + path.resolve(root) + '/'), '').replace(/.js$/, '')] = file;
      }
    } else if (fs.statSync(file).isDirectory()) {
      surface.load(root, file, paths);
    }
  });
  return paths;
};
