var request = require('superagent')
  , app = require('koa')()
  , Surface = require('..')
  ;

var surface = Surface(app, {root: './examples/json/lib'});
app.listen(3030);

describe('api', function(){
  describe('/', function() {
    it('should turn index into / and get "Hello World!" as res.body.data', function() {
      request.get('http://127.0.0.1:3030/index')
        .set('Accept', 'application/json')
        .end(function(res) {
          res.body.should.have.properties({data: 'Hello World!'});
        });
    });
  });
});