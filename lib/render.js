var js2xmlparser = require("js2xmlparser");

var defaultFormat = ['json', 'xml'];

/**
 * To parse ctx.body to the format which has been set.
 * 
 * @param  {ANY}    data ctx.body
 * @param  {Object} ctx  context object of koa
 * @return {String}      formated data
 * @api private
 */
exports.format = function(fields, body, status, ctx) {
  var format = this.checkFormat(ctx.query.format, ctx.accepts(defaultFormat));

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
    }, fields);
    ctx.type = format;
    ctx.res.statusCode = status;
  }
};

exports.checkFormat =  function(format, _format) {
  if (format) {
    return defaultFormat.indexOf(format.toLowerCase()) === -1 ? _format : format;
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
