var request = require('superagent')
  , app = require('koa')()
  , Surface = require('..')
  , xml2jsParser = require('superagent-xml2jsparser')
  ;

var surface = Surface(app, {root: './examples/simple/lib'})
  , localhost = 'http://127.0.0.1:3030/'
  ;

app.listen(3030);
describe('Controllers', function(){
  describe('index', function() {
    describe('#index() GET /', function() {
      it('should get res.body.data = "Hello World!"', function() {
        request.get(localhost)
          .end(function(res) {
            res.status.should.eql(200, 'need 200');
            res.body.should.have.properties({data: {Hello: 'World'}});
          });
      });
      it('should be responsed in xml format and still get res.body.data = "Hello World!"', function() {
        request.get(localhost)
          .query({ format: 'xml' })
          .accept('xml')
          .parse(xml2jsParser)
          .buffer()
          .end(function(err, res) {
            res.status.should.eql(200, 'need 200');
            res.body.response.should.have.properties({data: [{Hello: ['World']}]});
          });
      });
      it('should get res.status = 204', function() {
        request.get(localhost)
          .query({ empty: 'true'})
          .end(function(res) {
            res.status.should.eql(204, 'need 204');
          });
      });
    });
  });
  describe('items', function() {
    var ctrlName = this.title;
    describe('#index() GET /' + ctrlName, function() {
      it('should get res.body.data = model.index()', function() {
        request.get(localhost + ctrlName)
          .end(function(res) {
            res.status.should.eql(200, 'need 200');
            res.body.data.should.eql(surface.models.items.index());
          });
      });
      it('should be responsed in xml format and still get res.body.data = model.index()', function() {
        request.get(localhost + ctrlName)
          .query({ format: 'xml' })
          .accept('xml')
          .parse(xml2jsParser)
          .buffer()
          .end(function(err, res) {
            res.status.should.eql(200, 'need 200');
            res.body.response.data.should.be.an.Object;
          });
      });
    });
    describe('#create() POST /' + ctrlName, function() {
      describe('send post:true', function() {
        it('should get res.body = "true"', function() {
          request.post(localhost + ctrlName)
            .send({ post: 'true' })
            .end(function(res) {
              res.status.should.eql(200, 'need 200');
              res.body.data.should.eql('true', 'need new');
            });
        });
      });
      describe('send nothing', function() {
        it('should get res.status = 415', function() {
          request.post(localhost + ctrlName)
            .end(function(res) {
              res.status.should.eql(415, 'need 415');
              res.body.should.not.have.data;
            });
        });
      });
    });
    describe('#get() GET /' + ctrlName + ':id', function() {
      it('should get res.body.id = params.id', function() {
        request.get(localhost + ctrlName + '/a')
          .end(function(res) {
            res.body.data.should.eql('A', 'need A');
          });
      });
    });
  });
  describe('users', function() {
    var ctrlName = this.title;
    describe('/', function() {
      describe('#index()', function() {
        it('should get res.body = "in users"', function() {
          request.get(localhost + ctrlName)
            .end(function(res) {
              res.status.should.eql(200, 'need 200');
              res.body.data.should.eql('in users');
            });
        });
      });
      describe('oauth', function() {
        describe('#entry()', function() {
          it('should get /auth/index res.body = "in sub dir"', function() {
            request.get(localhost + ctrlName + '/auth/index')
              .end(function(res) {
                res.status.should.eql(200, 'need 200');
                res.body.data.should.eql('in sub dir');
              });
          });
        });
      });
      describe('info', function() {
        describe('#index()', function() {
          it('should get res.body = "in /users/info"', function() {
            request.get(localhost + ctrlName + '/info/mail')
              .end(function(res) {
                res.body.data.should.eql('in /users/info');
              });
          });
        });
      });
    });
  });
  describe('/*', function() {
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