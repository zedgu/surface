/**
 * Surface
 * Version: 0.0.2
 * License: MIT
 */
'use strict';

/**
 * Dependencies
 */
var router = require('koa-router')
  , methods = require('methods')
  , fs = require('fs')
  , path = require('path')
  , xml = require('xml')
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
 */
function Surface(app, option) {
  if (this instanceof Surface) {
    this._conf = {
      root: './lib',
      ctrl: 'controllers',
      model: 'models',
      format: 'json',
      multiple: false, // TODO Multiple routers
      routes: {
        'index': {
          method: 'get',
          path: ''
        },
        'create': {
          method: 'post',
          path: '/'
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
        'index': '/'
      }
    };
    this._format = ['json', 'xml'];
  } else {
    var surface = new Surface();
    return surface.fn(app, option);
  }
}

var surface = Surface.prototype;

/**
 * Constructor of Surface
 * @param  {Object}  app    koa().
 * @param  {Object}  option Config object.
 * @return {Surface}        instance of Surface.
 */
surface.fn = function(app, option) {
  var conf = this.setting(option)
    , files = this.files = this.load('ctrl')
    , ctrl
    , ctrlName
    , routes
    ;


  if (conf.multiple) {
    // TODO
  } else {
    app.use(router(app));
  }

  app.use(this.middleware());

  // register routes
  for (var file in files) {
    ctrl = require(files[file]);
    ctrlName = ctrl.alias || conf.aliases[file.toLowerCase()] || file.toLowerCase();
    routes = ctrl.routes || this.routes;

    for (var action in ctrl) {
      if (!!router(action)) {
        this.register(app, ctrlName, routes[action], ctrl[action]);
      }
    }
  }

  // 404
  app.all('*', function *(next) {
    this.status = 404;
    yield next;
  });

  return this;
};

/**
 * JSON Result Format
 * @param  {String} req  String
 * @param  {Number} code HTTP Code
 * @param  {String} msg  String of HTTP Status
 * @param  {Object} data Real data
 * @return {Object}      Formated data
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
 */
surface.xml = function(req, code, msg, data) {
  var json = this.json(req, code, msg, data)
    , xmlObject = {
        response: (function toXmlObejct(j) {
          var node
            , o = []
            ;
          for (var k in j) {
            node = {};
            if (isObject(j[k])) {
              node[k] = toXmlObejct(j[k]);
            } else {
              node[k] = j[k];
            }
            o.push(node);
          }
          return o;
        })(json)
      }
    ;
  return xml(xmlObject, { declaration: true });
};

/**
 * Set conf
 * @param  {Object} option Option objest
 * @return {Object}        Formated conf object
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

/**
 * middleware of Surface
 * @return {Generator} middleware for koa
 */
surface.middleware = function() {
  var surface = this;
  return function *API(next) {
    this.body = surface.api(this.body, this);
    yield next;
  };
};

/**
 * To parse ctx.body to the format which has been set.
 * 
 * @param  {ANY}    data ctx.body
 * @param  {Object} ctx  context object of koa
 * @return {String}      formated data
 */
surface.api = function(data, ctx) {
  var format = this.checkFormat(ctx.query.format);
  if (format === 'xml') {
    ctx.type = 'Content-type: application/xml; charset=utf-8';
  }

  if (ctx.status === 200 && data === '') {
    ctx.status = 204;
  }

  return this[format](ctx.path, ctx.status, ctx.toJSON().response.string, data);
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
 * register route
 * @param  {Object}   app      koa()
 * @param  {String}   ctrlName name of the controller
 * @param  {Object}   route    object of route rule
 * @param  {Function} fn       callback fn for koa-router
 */
surface.register = function(app, ctrlName, route, fn) {
  if (!!route) {
    app[route.method](path.join('/', ctrlName, route.path), fn);
  }
};

/**
 * to load files
 * @param  {String} components 'ctrl' or 'model'
 * @return {Object}            name:path
 */
surface.load = function(components) {
  var dirPath = path.resolve(path.join(this.conf.root, '/', this.conf[components]))
    , paths = {}
    , files
    ;
  try {
    files = fs.readdirSync(dirPath)
  } catch(e) {
    files = [];
  }
  files.forEach(function(file) {
    file = path.join(dirPath, '/', file);
    if (fs.statSync(file).isFile() && path.extname(file) == '.js') {
      paths[path.basename(file, '.js')] = file;
    }
  });
  return paths;
};