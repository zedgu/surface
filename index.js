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
 * @param {Object} app     koa().
 * @param {Object} options Config object.
 * @api public
 */
function Surface(app, options) {
  if (this instanceof Surface) {
    this._conf = {
      root: './lib',
      ctrl: 'controllers',
      model: 'models',
      format: 'json',
      totally: true,
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
    var surface = new Surface(app, options);
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
 * @param  {Object} options Options objest
 * @return {Object}         Formated conf object
 * @api private
 */
surface.setting = function(options) {
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

  this.routes = conf.routes;
  conf.format = this.checkFormat(conf.format, _conf.format);

  for (var key in conf.fields) {
    if (_conf.fields[key] && conf.fields[key] ) {
      fields[key] = conf.fields[key]
    }
  }

  return conf;
};

surface.init = function(app, options) {
  this.setting(options);
  router = new Router(app);

  var ctrls = this._ctrls = this.load(path.join(this.conf.root, '/', this.conf['ctrl']))
    , models = this._models = this.load(path.join(this.conf.root, '/', this.conf['model']))
    , C = this.ctrls = {}
    , M = this.models = {}
    , getModel = function(modelName) {
        if (typeof modelName === 'string') {
          return M[modelName];
        } else {
          return this._model;
        }
      }
    , ctrl
    , ctrlName
    , basename
    , alias
    ;


  for (var file in models) {
    M[file] = require(models[file]);
  }
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
    ctrl.model = getModel;

    if (models[file]) {
      ctrl._model = M[file];
    }
  }

  app.use(this.middleware());
  app.use(router.middleware());
  this.register(app); // register routes
  this.api(app);
};

/**
 * middleware of Surface
 * @return {Generator} middleware for koa
 */
surface.middleware = function() {
  var surface = this;
  return function *Surface(next) {
    yield next;
    if (!this.wrap ? false : (surface.conf.totally ? true : this._surface)) {
      surface.format(this.body, this.status, this);
    }
  };
};

/**
 * reg api into app.context
 * @param  {koa} app the instance of koa
 * @api private
 */
surface.api = function(app) {
  var surface = this;
  /**
   * get model object via ctx
   * @param  {String} name model name
   * @return {Object}      model object
   */
  app.context.model = function(name) {
    name = name || router.match(this.path)[0].route.name;
    return surface.models[name];
  };
  app.context.wrap = true;
  app.context._surface = false;
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
  var format = this.checkFormat(ctx.query.format, ctx.accepts(this._format))
    , status = ctx.status;
  if (format) {
    ctx.body = this[format]({
      path: ctx.path,
      status: ctx.status,
      message: ctx.toJSON().response.string,
      data: body
    });
    ctx.type = format;
    ctx.status = this.status(body, status);
  }
};

// if get empty body return 204
surface.status = function(body, status) {
  if (status === 200 && body === '') {
    status = 204;
  }
  return status;
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
 * @param  {Object}   app      koa()
 * @api private
 */
surface.register = function(app) {
  var ctrls = this.ctrls
    , ctrl
    , route
    ;
  for (var name in ctrls) {
    ctrl = ctrls[name];

    for (var action in ctrl) {

      route = ctrl.routes ? (ctrl.routes[action] || this.routes[action]) : this.routes[action];

      if (!!route) {
        app[route.method](name, path.join('/', ctrl.ctrlName, route.path), function(action) {
          return function *(next) {
            yield action.bind(this)(next);
            this._surface = true;
            yield next;
          };
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
