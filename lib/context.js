/**
 * reg api into app.context
 * @param  {koa} app the instance of koa
 * @api private
 */
module.exports = function(app, surface) {
  var context = app.context;

  context.format = format;
};

function format(_format) {
  var f = this.query.format || '';
  f = f.toLowerCase();
  if (~['json', 'xml'].indexOf(f)) {
    return f;
  }

  return this.accepts(_format) || _format[0];
}
