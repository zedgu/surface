var js2xmlparser = require("js2xmlparser");

/**
 * To parse ctx.body to the format which has been set.
 * 
 * @param  {String} format
 * @param  {String} path   ctx.path
 * @param  {Number} status HTTP Code
 * @param  {String} msg    Message
 * @param  {Object} body   data
 * @param  {Object} fields fields name
 * @return {String}      formated data
 * @api private
 */
exports.format = function(format, path, status, msg, body, fields) {
  return this[format]({
    path: path,
    status: status,
    message: msg,
    data: body
  }, fields);
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
exports.json = function(data, fields) {
  var res = {};

  for (var key in fields) {
    res[fields[key]] = data[key]
  }

  return res;
};

/**
 * XML Result Format
 * @param  {Object} data Real data
 * @return {String}      String of XML Document
 * @api private
 */
exports.xml = function(data, fields) {
  var json = this.json(data, fields);

  return js2xmlparser('response', json, {
    wrapArray : {
      enabled : false
    },
    prettyPrinting: {
      enabled : false
    }
  });
};

exports.checkFormat = function(_format) {
  var f = this.query.format || '';
  f = f.toLowerCase();
  if (~['json', 'xml'].indexOf(f)) {
    return f;
  }

  return this.accepts(_format) || _format[0];
};
