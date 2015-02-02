/**
 * reg api into app.context
 * @param  {koa} app the instance of koa
 * @api private
 */
module.exports = function(app, surface) {
  var context = app.context;

  context.format = format;
  // context.inputs = inputs;
};

function format(_format) {
  var f = this.query.format || this.accepts(_format) || _format[0];
  f = f.toLowerCase();
  if (~['json', 'xml'].indexOf(f)) {
    return f;
  }

  return _format[0];
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
