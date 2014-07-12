Surface
===========
[![NPM version][npm-image]][npm-url] 
[![build status][travis-image]][travis-url] 
[![Test coverage][coveralls-image]][coveralls-url]

A tiny middleware of RESTful API for koa.

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
:resource/      get            index
:resource/new   post           new
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
  format: 'json',
  routes: {
    'index': {
      method: 'get',
      path: ''
    },
    'new': {
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
}
```
###APIs
####In app
```js
surface(app[, options])
```
`options` see **Default values**

####In controller
#####set alias singly
```js
exports.alias = 'name_you_want';
```
#####set routes singly
```js
exports.routes = {
  create: {
    method: 'post',
    path: '/:id'
  }
};
```

[npm-image]: https://img.shields.io/npm/v/surface.svg?style=flat
[npm-url]: https://npmjs.org/package/surface
[travis-image]: https://img.shields.io/travis/zedgu/surface.svg?style=flat
[travis-url]: https://travis-ci.org/zedgu/surface
[coveralls-image]: https://img.shields.io/coveralls/zedgu/surface.svg?style=flat
[coveralls-url]: https://coveralls.io/r/zedgu/surface?branch=master