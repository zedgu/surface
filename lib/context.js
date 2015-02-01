/**
 * reg api into app.context
 * @param  {koa} app the instance of koa
 * @api private
 */
module.exports = function(app, surface) {
  var context = app.context;

  context.model = getObj('models', surface);
  context.ctrl = getObj('ctrls', surface);
  context.inputs = inputs;
};

function getObj(obj, surface) {
  /**
   * get model/ctrl object via ctx
   * @param  {String} name model/ctrl name
   * @return {Object}      model/ctrl object
   */
  return function(name) {
    name = name || surface.routers.match(this.path)[0].route.name;
    return surface[obj][name.toLowerCase()];
  }
}

function inputs(query, requires, options) {
  var missingRequires = [];

  if (typeof requires !== 'string') {
    requires = '';
  }
  if (typeof options !== 'string') {
    options = '';
  }
  requires = requires.split(' ');
  options = requires.split(' ');

  for (var i = requires.length - 1; i >= 0; i--) {
    if (query[requires[i]] === undefined) {
      missingRequires.push(requires[i]);
    }
  };

  if (!!missingRequires.length) {
    return false;
  }
}
