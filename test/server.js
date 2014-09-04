var agent = require('supertest')
  , Surface = require('..')
  , xml2jsParser = require('superagent-xml2jsparser')
  ;

describe('Controllers', function(){
  var app = require('koa')()
    , surface = Surface(app, {root: './examples/simple/lib'})
    , request = agent(app.callback())
    ;
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
          .expect(204, done);
      });
    });
  });
  describe('/items', function() {
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
  describe('/users', function() {
    var ctrlName = this.title;
    describe('/', function() {
      describe('#index()', function() {
        it('should get res.body = "in users"', function(done) {
          request
            .get(ctrlName)
            .expect(200)
            .expect('in users', done);
        });
      });
    });
    describe('/oauth', function() {
      describe('#entry()', function() {
        it('should get /index res.body = "in sub dir"', function(done) {
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
      describe('#post() POST /:id', function() {
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
    describe('/info', function() {
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
  describe('/*', function() {
    describe('GET', function() {
      it('should get 404 status', function(done) {
        request
          .get('/the/path/is/not/exist')
          .expect(404)
          .end(function(err, res) {
            res.body.should.have.properties(['request', 'code', 'msg']);
            done(err);
          });
      });
    });
    describe('POST', function() {
      it('should get 404 status', function(done) {
        request
          .post('/the/path/is/not/exist')
          .expect(404, done);
      });
    });
  });
  describe('nosniff', function() {
    it('should get X-Content-Type-Options by default', function(done) {
      request
        .get('')
        .expect(200)
        .expect('X-Content-Type-Options', 'nosniff', done);
    });
    it('should not get X-Content-Type-Options by conf.nosniff = false', function(done) {
      surface.conf.nosniff = false;
      request
        .get('')
        .expect(200)
        .end(function(err, res) {
          res.headers.should.not.have.property('X-Content-Type-Options');
          done(err);
        });
    });
  });
});

describe('Custom response fields', function() {
  var app = require('koa')()
    , surface = Surface(app, {
        root: './examples/simple/lib',
        fields: {
          status: 'statusCode',
          data: 'res',
          app: 'a'
        }
      })
    , request = agent(app.callback())
    ;
  describe('GET /', function() {
    it('should get res.body.res = "Hello World!"', function(done) {
      request
        .get('')
        .expect(200)
        .expect({statusCode: 200, res: {Hello: 'World'}}, done);
    });
  });
});

describe('Only format when the url match prefix', function() {
  var app = require('koa')()
    , surface = Surface(app, {
        root: './examples/simple/lib',
        prefix: true
      })
    , request = agent(app.callback())
    ;
  describe('the url not match the prefixPattern', function() {
    it('should not format the response', function(done) {
      request
        .get('')
        .expect(200)
        .expect('{"Hello":"World"}', done);
    });
    it('should not format the response and get 404 status', function(done) {
      request
        .get('/the/path/is/not/exist')
        .expect(404)
        .expect('Not Found', done);
    });
  });
  describe('the url match the prefixPattern', function() {
    it('should format the response', function(done) {
      request
        .get('/api/1.0/')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties({data: '1.0'});
          done(err);
        });
    });    
    it('should not format the response when skip_surface == true', function(done) {
      request
        .post('/api/1.0/')
        .expect(200)
        .expect('not format', done)
    });
  });
});