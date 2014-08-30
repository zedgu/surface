Surface
=======

[![NPM version][npm-image]][npm-url] 
[![build status][travis-image]][travis-url] 
[![Test coverage][coveralls-image]][coveralls-url]
[![NPM Monthly Downloads][npm-download]][npm-url]
[![Dependencies][david-image]][david-url]
[![License][license-image]][license-url]
[![Tips][tips-image]][tips-url]

A tiny middleware of RESTful API for koa.

* Dependence on koa-router.
* Support both JSON and XML format.
* Support customize response fields.
* Write a controller and get all route pattern you want.
* Compatible with other middlewares including view renders.

Install
-------
```sh
npm isntall surface --save
```

Simple Usage
------------
####Require...
```js
var surface = require('surface');
```

####Config...
```js
surface(app);
```

####Controller file
Default path of controllers: ./lib/controllers/

in index.js:
```js
exports.index = function *() {
  this.body = 'hello koa';
};
```
Checkout the [examples](https://github.com/zedgu/surface/tree/master/examples).

####Response body
Request the root of the app, for example: http://localhost:3000/, will be:

#####in JSON
```json
{
  "request": "/",
  "code": 200,
  "message": "OK",
  "data": "hello koa"
}
```

#####in XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <request>/</request>
  <code>200</code>
  <message>OK</message>
  <data>hello koa</data>
</response>
```

Conventions
-----------

####Action Mapping
```
route           http method    function of ctrl
:resource       get            index
:resource       post           create
:resource/:id   get            get
:resource/:id   put            update
:resource/:id   del            del
```
All routes can be customized by setting, see [Default values](#default-values); and also can be changed by controller api singly, see [APIs - Routes](#routes).

####Resource
Resource name will be the file name of the controller, if there is no alias set for the controller, see [APIs - Alias](#alias).

APIs
----
####Options
```js
surface(app[, options])
```
`options` see [Default values](#default-values)

####Controller APIs
#####Alias
Set alias for the controller.

```js
exports.alias = 'name_you_want';
```

#####Routes
Set routes for the controller.

```js
exports.routes = {
  entry: {
    method: 'get',
    path: '/index'
  }
};
```
#####Register route directly

```js
var surface = require('surface')(app);
suface.reg('http method', 'name of this route', 'route url pattern', callback);
```

#####Wrap
Set false to not format by surface.

```js
ctx.wrap = false;
```

#####Model
Get model object.

```js
/**
 * get model object by given controller file name
 *
 * @param   {String}   modelName   optional, undefined for the model has
 *                                 the the same name as this controller
 * @return  {Object}               model object
 */
ctx.model([modelName])
exports.model([modelName])
```

for exmample:

```js
exports.get = function *(next) {
  this.model(); // this === ctx
  yield next;
};
// or
exports.todo = function() {
  this.model(); // this === exports
};
```

#####Format
Get the specifying format
- by query parameter
- by header `Accept`
- by default setting via options.format

> parmeter > Accept > options

Global configuration
--------------------
####Default values
```js
{
  root: './lib',        // root dir
  ctrl: 'controllers',  // controllers dir
  model: 'models'       // model dir
  format: 'json',       // format by default
  totally: true,        // true,  format all routes;
                        // false, only routes setting by controllers.
  nosniff: true,        // X-Content-Type-Options
                        // see http://msdn.microsoft.com/library/ie/gg622941(v=vs.85).aspx
  fields: {
    path: 'request',    // request url
    status: 'code',     // http status code
    message: 'msg',     // http status message
    data: 'data'        // real data
  },
  aliases: {
    'index': ''
  },
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
  }
}
```

License
-------
MIT

[npm-image]: https://img.shields.io/npm/v/surface.svg?style=flat-square
[npm-url]: https://npmjs.org/package/surface
[travis-image]: https://img.shields.io/travis/zedgu/surface.svg?style=flat-square
[travis-url]: https://travis-ci.org/zedgu/surface
[coveralls-image]: https://img.shields.io/coveralls/zedgu/surface.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/zedgu/surface?branch=master
[david-image]: http://img.shields.io/david/zedgu/surface.svg?style=flat-square
[david-url]: https://david-dm.org/zedgu/surface
[npm-status]: https://nodei.co/npm/surface.png?downloads=true
[npm-status-url]: https://nodei.co/npm/surface/
[license-image]: http://img.shields.io/npm/l/surface.svg?style=flat-square
[license-url]: https://github.com/zedgu/surface/blob/master/LICENSE
[npm-download]: http://img.shields.io/npm/dm/surface.svg?style=flat-square
[tips-image]: http://img.shields.io/gittip/zedgu.svg?style=flat-square
[tips-url]: https://www.gittip.com/zedgu/