var app = require('koa')()
  , path = require('path')
  , surface = require('../..')
  ;

surface(app);

app.listen(3030);