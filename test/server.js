var request = require('superagent')
  , app = require('koa')()
  , Surface = require('..')
  , xml2jsParser = require('superagent-xml2jsparser')
  ;

var surface = Surface(app, {root: './examples/simple/lib'})
  , localhost = 'http://127.0.0.1:3030';
app.listen(3030);

describe('Server Testing', function(){
  describe('GET /', function() {
    it('should get res.body.data = "Hello World!"', function() {
      request.get(localhost + '/')
        .end(function(res) {
          res.status.should.eql(200, 'not 200');
          res.body.should.have.properties({data: 'Hello World!'});
        });
    });
    it('should be responsed in xml format and still get res.body.data = "Hello World!"', function() {
      request.get(localhost + '/')
        .query({ format: 'xml' })
        .accept('xml')
        .parse(xml2jsParser)
        .buffer()
        .end(function(err, res) {
          res.status.should.eql(200, 'not 200');
          res.body.response.should.have.properties({data: ['Hello World!']}); // xml2js format child node into []
        });
    });
  });
  describe('GET /:id', function() {
    describe('if this.body = "", ', function() {
      it('should get res.status = 204', function() {
        request.get(localhost + '/204')
          .end(function(res) {
            res.status.should.eql(204, 'not 204');
          });
      });      
    });
  });
  describe('GET /*', function() {
    it('should get 404 status', function() {
      request.get(localhost + '/i/do/not/the/correct/path')
        .end(function(res) {
          res.status.should.eql(404, 'need back 404');
        });
    });
  });
});