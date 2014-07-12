var request = require('superagent')
  , app = require('koa')()
  , Surface = require('..')
  , xml2jsParser = require('superagent-xml2jsparser')
  ;

var surface = Surface(app, {root: './examples/simple/lib'})
  , localhost = 'http://127.0.0.1:3030';
app.listen(3030);

describe('Controllers', function(){
  describe('index', function() {
    describe('#index() GET /', function() {
      it('should get res.body.data = "Hello World!"', function() {
        request.get(localhost + '/')
          .end(function(res) {
            res.status.should.eql(200, 'need 200');
            res.body.should.have.properties({data: {Hello: 'World'}});
          });
      });
      it('should be responsed in xml format and still get res.body.data = "Hello World!"', function() {
        request.get(localhost + '/')
          .query({ format: 'xml' })
          .accept('xml')
          .parse(xml2jsParser)
          .buffer()
          .end(function(err, res) {
            res.status.should.eql(200, 'need 200');
            res.body.response.should.have.properties({data: [{Hello: ['World']}]}); // xml2js format child node into []
          });
      });
      it('should get res.status = 204', function() {
        request.get(localhost + '/')
          .query({ empty: 'true'})
          .end(function(res) {
            res.status.should.eql(204, 'need 204');
          });
      });
    });
    describe('#create() POST /', function() {
      describe('send post:true', function() {
        it('should get res.body = "new"', function() {
          request.post(localhost + '/')
            .send({ post: 'true' })
            .end(function(res) {
              res.body.data.should.eql('new', 'need new');
            });
        });
      });
      describe('send nothing', function() {
        it('should get res.status = 415', function() {
          request.post(localhost + '/')
            .end(function(res) {
              res.status.should.eql(415, 'need 415');
              res.body.should.not.have.data;
            });
        });
      });
    });
  });
  describe('#get() GET /:id', function() {
    it('should get res.body.id = params.id', function() {
      request.get(localhost + '/iddddd')
        .end(function(res) {
          res.body.data.id.should.eql('iddddd', 'need iddddd');
        });
    });
  });
  describe('ALL /*', function() {
    describe('GET', function() {
      it('should get 404 status', function() {
        request.get(localhost + '/i/do/not/the/correct/path')
          .end(function(res) {
            res.status.should.eql(404, 'need 404');
          });
      });
    });
    describe('POST', function() {
      it('should get 404 status', function() {
        request.post(localhost + '/i/do/not/the/correct/path')
          .end(function(res) {
            res.status.should.eql(404, 'need 404');
          });
      });
    });
  });
});