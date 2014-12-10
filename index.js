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
  , fs = require('fs')
  , path = require('path')
  , debug = require('debug')('surface:debug')
  , methods = require('methods')
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
 * @param {Object} app     koa().
 * @param {Object} options Config object.
 * @api public
 */
function Surface(app, options) {
  if (this instanceof Surface) {
    this._conf = {
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
    this._format = ['json', 'xml'];

    this.init(app, options);
  } else {
    return new Surface(app, options);
  }
}

var surface = Surface.prototype;

surface.init = function(app, options) {
  this.app = app;
  setting.bind(this)(options);
  router = new Router(app);

  var ctrls = this._ctrls = loadfiles(path.join(this.conf.root, '/', this.conf['ctrl']))
    , models = this._models = loadfiles(path.join(this.conf.root, '/', this.conf['model']))
    , C = this.ctrls = {}
    , M = this.models = {}
    , getModel = function(modelName) {
        if (typeof modelName === 'string') {
          return M[modelName.toLowerCase()];
        } else {
          return this._model;
        }
      }
    , getCtrl = function(ctrlName) {
        if (typeof ctrlName === 'string') {
          return C[ctrlName.toLowerCase()];
        } else {
          return this;
        }
      }
    , ctrl
    , basename
    , alias
    ;


  for (var file in models) {
    M[file.toLowerCase()] = require(models[file]);
  }
  for (var file in ctrls) {
    file = file.toLowerCase();
    ctrl = C[file] = require(ctrls[file]);
    basename = path.basename(file);

    if (typeof ctrl.alias === 'string') {
      alias = ctrl.alias;
    } else if (typeof this.conf.aliases[basename] === 'string') {
      alias = this.conf.aliases[basename];
    } else {
      alias = basename;
    }
    ctrl.ctrlName = file.replace(new RegExp(basename + '$'), alias).replace(/\/$/, '');
    ctrl.model = getModel;
    ctrl.ctrl = getCtrl;

    if (models[file]) {
      ctrl._model = M[file];
    }
  }

  app.use(this.middleware());
  app.use(router.middleware());
  routesRegister.bind(this)(); // register routes
  contextAPI.bind(this)();
};

/**
 * middleware of Surface
 * @return {Generator} middleware for koa
 */
surface.middleware = function() {
  var surface = this
    , conf = this.conf;
  return function *Surface(next) {
    yield next;

    debug(conf.prefixPattern, this.url, conf.prefixPattern.test(this.url));
    if (this.skip_surface || (conf.prefix && !conf.prefixPattern.test(this.url))) {
      return;
    }
    surface.format(this.body, this.res.statusCode, this);
    if (conf.nosniff) {
      this.response.set('X-Content-Type-Options', 'nosniff')
    }
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
surface.format = function(body, status, ctx) {
  var format = this.checkFormat(ctx.query.format, ctx.accepts(this._format));

  if (status === 204 || status === 205 || status === 304) {
    return;
  }

  if (format) {
    ctx.body = this[format]({
      path: ctx.path,
      status: ctx.res.statusCode,
      /**
       * ctx.toJSON().response.string for <= koa@0.12.2,
       * see https://github.com/koajs/koa/pull/353
       * and https://github.com/koajs/koa/commit/eb443d1bee748b3429d5308757573ec083e7e899#diff-d86a59ede7d999db4b7bc43cb25a1c11R477
       */
      message: ctx.res.statusMessage || ctx.toJSON().response.string || ctx.toJSON().response.message,
      data: body
    });
    ctx.type = format;
    ctx.res.statusCode = status;
  }
};

surface.checkFormat = function(format, _format) {
  if (format) {
    return this._format.indexOf(format.toLowerCase()) === -1 ? _format : format;
  } else {
    return _format;
  }
};

/**
 * JSON Result Format
 * @param  {Object} data data.path String
 *                       data.status HTTP Code
 *                       data.message String of HTTP Status
 *                       data.data Real data
 * @return {Object}      Formated data
 * @api private
 */
surface.json = function(data) {
  var res = {}
    , fields = this.fields;

  for (var key in fields) {
    res[fields[key]] = data[key]
  }

  return res;
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
 * @param  {String}   method http method
 * @param  {String}   name   route name of koa-router
 * @param  {String}   path   route url pattern
 * @param  {Function} fn     route function
 * @return {Koa} app instance of koa
 */
surface.register = function(method, name, path, fn) {
  if (~methods.indexOf(method)) {
    return this.app[method](name, path, function *(next) {
      yield fn.bind(this)(next);
      yield next;
    });
  }
};

/**
 * Set conf
 * @param  {Object} options Options objest
 * @return {Object}         Formated conf object
 * @api private
 */
function setting(options) {
  var _conf = this._conf
    , conf = this.conf = {}
    , fields = this.fields = {}
    ;
  if (!isObject(options)) {
    options = {};
  }
  for (var key in _conf) {
    conf[key] = options[key] === undefined ? _conf[key] : options[key];
  }

  conf.format = this.checkFormat(conf.format, _conf.format);

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

  for (var key in conf.fields) {
    if (_conf.fields[key] && conf.fields[key] ) {
      fields[key] = conf.fields[key]
    }
  }

  return conf;
};

/**
 * reg api into app.context
 * @param  {koa} app the instance of koa
 * @api private
 */
function contextAPI() {
  var app = this.app
    , fn = function(obj, surface) {
        return function(name) {
          name = name || router.match(this.path)[0].route.name;
          return surface[obj][name.toLowerCase()];
        }
      }
    ;
  /**
   * get model/ctrl object via ctx
   * @param  {String} name model/ctrl name
   * @return {Object}      model/ctrl object
   */
  app.context.model = fn('models', this);
  app.context.ctrl = fn('ctrls', this);
};

/**
 * register all routes
 * @api private
 */
function routesRegister() {
  var ctrls = this.ctrls
    , routes = this.conf.routes
    , conf = this.conf
    , ctrl
    , route
    ;

  for (var name in ctrls) {
    name = name.toLowerCase();
    ctrl = ctrls[name];

    for (var action in ctrl) {

      route = ctrl.routes ? (ctrl.routes[action] || routes[action]) : routes[action];

      if (!!route) {
        var routePath = path.join(typeof conf.prefix === 'string' ? conf.prefix : '/', ctrl.ctrlName, route.path);
        debug(route.method, name, ctrl.ctrlName, routePath, action);

        this.register(route.method, name, routePath, function(fn) {
          if (conf.authenticate && conf.authenticatePattern.test(routePath)) {
            return function *() {
              if (yield conf.authenticate.bind(this)()) {
                yield fn.bind(this)();
              } else {
                yield conf.deny.bind(this)();
              }
            }
          } else {
            return fn;
          }
        }(ctrl[action]));
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
function loadfiles(root, subPath, paths) {
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
        paths[file.replace(new RegExp('^' + path.resolve(root) + '/'), '').replace(/.js$/, '').toLowerCase()] = file;
      }
    } else if (fs.statSync(file).isDirectory()) {
      loadfiles(root, file, paths);
    }
  });
  return paths;
}
