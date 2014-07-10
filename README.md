Surface
===========

A tiny middleware of RESTful API for koa.

* Dependence on koa-router.
* Support JSON and XML format at the same time.
* Write a controller and get all route pattern you want.
* Transparent to coders.

###Install

    npm isntall surface --save

###Simple Usage
####Require...

    var surface = require('surface');

####Config in app.js

    surface(app);

####Controller file
Default path of controllers: ./lib/controllers/

in index.js:

    exports.index = function *(next) {
      this.body = 'hello koa';
      yield next;
    };

####Response body
Request the root of the app, for example: http://localhost:3000/, will be:

#####in JSON

    {
      "request": "/",
      "code": 200,
      "message": "OK",
      "data": "hello koa"
    }

#####in XML

    <?xml version="1.0" encoding="UTF-8"?>
    <response>
      <request>/</request>
      <code>200</code>
      <message>OK</message>
      <data>hello koa</data>
    </response>

###Conventions
####Action Mapping

    route           http method    function of ctrl
    :resource/      get            index
    :resource/new   post           new
    :resource/:id   get            get
    :resource/:id   put            update
    :resource/:id   del            del

####Resource
Resource name will be the file name of the controller, if there is no alias set for the controller.

###Global configuration
####Default values

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

###APIs
####In app

    surface(app[, options])

`options` see **Default values**

####In controller
#####set alias singly

    exports.alias = 'name_you_want';

#####set routes singly

    exports.routes = {
      create: {
        method: 'post',
        path: '/:id'
      }
    };

