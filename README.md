Surface
===========
[![NPM version][npm-image]][npm-url] 
[![build status][travis-image]][travis-url] 
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependencies][david-image]][david-url]

A tiny middleware of RESTful API for koa.

[![NPM][npm-status]][npm-status-url]

* Dependence on koa-router.
* Support JSON and XML format at the same time.
* Write a controller and get all route pattern you want.
* Transparent to coders.

###Install
```
npm isntall surface --save
```
###Simple Usage
####Require...
```js
var surface = require('surface');
```
####Config in app.js
```js
surface(app);
```
####Controller file
Default path of controllers: ./lib/controllers/

in index.js:
```js
exports.index = function *(next) {
  this.body = 'hello koa';
  yield next;
};
```
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
###Conventions
####Action Mapping
```
route           http method    function of ctrl
:resource       get            index
:resource       post           create
:resource/:id   get            get
:resource/:id   put            update
:resource/:id   del            del
```
####Resource
Resource name will be the file name of the controller, if there is no alias set for the controller.

###Global configuration
####Default values
```js
{
  root: './lib',
  ctrl: 'controllers',
  model: 'models'
  format: 'json',
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
}
```
###APIs
####In app
```js
surface(app[, options])
```
`options` see [Default values](#default-values)

####In controller
#####set alias for this controller
```js
exports.alias = 'name_you_want';
```
#####set routes for this controller
```js
exports.routes = {
  entry: {
    method: 'get',
    path: '/index'
  }
};
```
#####get model object
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

[npm-image]: https://img.shields.io/npm/v/surface.svg?style=flat
[npm-url]: https://npmjs.org/package/surface
[travis-image]: https://img.shields.io/travis/zedgu/surface.svg?style=flat
[travis-url]: https://travis-ci.org/zedgu/surface
[coveralls-image]: https://img.shields.io/coveralls/zedgu/surface.svg?style=flat
[coveralls-url]: https://coveralls.io/r/zedgu/surface?branch=master
[david-image]: http://img.shields.io/david/zedgu/surface.svg?style=flat
[david-url]: https://david-dm.org/zedgu/surface
[npm-status]: https://nodei.co/npm/surface.png?downloads=true
[npm-status-url]: https://nodei.co/npm/surface/
