var path = require('path');
var Router = require('koa-router');
var methods = require('methods');
var debug = require('debug')('surface:debug');

module.exports = function(app, surface) {
  var router = new Router(app);

  app.use(router.middleware());
  routesRegister.bind(surface)(app); // register routes

  return router;
};

/**
 * register all routes
 * @api private
 */
function routesRegister(app) {
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
        debug('%s %s %s %s %s', route.method, name, ctrl.ctrlName, routePath, action);

        register(app, route.method, name, routePath, function(fn) {
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
 * register route
 * @param  {String}   method http method
 * @param  {String}   name   route name of koa-router
 * @param  {String}   path   route url pattern
 * @param  {Function} fn     route function
 * @return {Koa} app instance of koa
 */
function register(app, method, name, path, fn) {
  if (~methods.indexOf(method)) {
    return app[method](name, path, function *(next) {
      yield fn.bind(this)(next);
      yield next;
    });
  }
}
