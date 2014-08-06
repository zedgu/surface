var request = require('supertest')
  , app = require('koa')()
  , Surface = require('..')
  , xml2jsParser = require('superagent-xml2jsparser')
  ;

var surface = Surface(app, {root: './examples/simple/lib'})
  ;

app.listen(3030);
request = request('http://127.0.0.1:3030/');

describe('Controllers', function(){
  describe('index', function() {
    describe('#index() GET /', function() {
      it('should get res.body.data = "Hello World!"', function(done) {
        request
          .get('')
          .expect(200)
          .end(function(err, res) {
            res.body.should.have.properties({data: {Hello: 'World'}});
            done(err);
          });
      });
      it('should be responsed in xml format and still get res.body.data = "Hello World!"', function(done) {
        request
          .get('')
          .query({ format: 'xml' })
          .parse(xml2jsParser)
          .buffer()
          .expect(200)
          .end(function(err, res) {
            res.body.response.should.have.properties({data: [{Hello: ['World']}]});
            done(err);
          });
      });
      it('should get res.status = 204', function(done) {
        request
          .get('')
          .query({ empty: 'true'})
          .expect(204)
          .end(function(err, res) {
            done(err);
          });
      });
    });
  });
  describe('items', function() {
    var ctrlName = this.title;
    describe('#index() GET /' + ctrlName, function() {
      it('should get res.body.data = model.index()', function(done) {
        request
          .get(ctrlName)
          .expect(200)
          .end(function(err, res) {
            res.body.data.should.eql(surface.models.items.index());
            done(err);
          });
      });
      it('should be responsed in xml format and still get res.body.data = model.index()', function(done) {
        request
          .get(ctrlName)
          .accept('xml')
          .parse(xml2jsParser)
          .buffer()
          .expect(200)
          .end(function(err, res) {
            res.body.response.data.should.be.an.Object;
            done(err);
          });
      });
    });
    describe('#create() POST /' + ctrlName, function() {
      describe('send post:true', function() {
        it('should get res.body = "true"', function(done) {
          request
            .post(ctrlName)
            .send({ post: 'true' })
            .expect(200)
            .end(function(err, res) {
              res.body.data.should.eql('true', 'need new');
              done(err);
            });
        });
      });
      describe('send nothing', function() {
        it('should get res.status = 415', function(done) {
          request
            .post(ctrlName)
            .expect(415)
            .end(function(err, res) {
              res.body.should.not.have.data;
              done(err);
            });
        });
      });
    });
    describe('#get() GET /' + ctrlName + ':id', function() {
      it('should get res.body.id = params.id', function(done) {
        request
          .get(ctrlName + '/a')
          .end(function(err, res) {
            res.body.data.should.eql('A', 'need A');
            done(err);
          });
      });
    });
  });
  describe('users', function() {
    var ctrlName = this.title;
    describe('/', function() {
      describe('#index()', function() {
        it('should get res.body = "in users"', function(done) {
          request
            .get(ctrlName)
            .expect(200)
            .end(function(err, res) {
              res.body.data.should.eql('in users');
              done(err);
            });
        });
      });
      describe('oauth', function() {
        describe('#entry()', function() {
          it('should get /auth/index res.body = "in sub dir"', function(done) {
            request
              .get(ctrlName + '/auth/index')
              .accept('text/html')
              .expect(200)
              .end(function(err, res) {
                res.text.should.eql('in sub dir');
                done(err);
              });
          });
        });
        describe('#post() POST /', function() {
          it('should get res.body.data = model().index()', function(done) {
            request
              .post(ctrlName + '/auth/')
              .expect(200)
              .end(function(err, res) {
                res.body.data.should.eql(surface.models['users/oauth'].index());
                done(err);
              });
          });
        });
        describe('#get() POST /', function() {
          it('should get res.body.data = model().index()', function(done) {
            request
              .post(ctrlName + '/auth/aa')
              .expect(200)
              .end(function(err, res) {
                res.body.data.should.eql(surface.models['items'].index());
                done(err);
              });
          });
        });
      });
      describe('info', function() {
        describe('#index()', function() {
          it('should get res.body = "in /users/info"', function(done) {
            request
              .get(ctrlName + '/info/mail')
              .end(function(err, res) {
                res.body.data.should.eql('in /users/info');
                done(err);
              });
          });
        });
      });
    });
  });
  describe('/*', function() {
    describe('GET', function() {
      it('should get 404 status', function(done) {
        request
          .get('/the/path/is/not/exist')
          .expect(404)
          .end(function(err, res) {
            done(err);
          });
      });
    });
    describe('POST', function() {
      it('should get 404 status', function(done) {
        request
          .post('/the/path/is/not/exist')
          .expect(404)
          .end(function(err, res) {
            done(err);
          });
      });
    });
  });
});