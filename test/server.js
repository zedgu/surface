var agent = require('supertest')
  , Surface = require('../lib/surface')
  , xml2jsParser = require('superagent-xml2jsparser')
  ;

describe('Controllers', function(){
  var app = require('koa')()
    , surface = Surface(app, {root: './examples/simple/lib'})
    , request = agent(app.callback())
    ;
  describe('index', function() {
    describe('GET /', function() {
      it('should be responsed in json format by default', function(done) {
        request
          .get('')
          .expect(200)
          .end(function(err, res) {
            res.body.should.have.properties({data: {Hello: 'World'}});
            done(err);
          });
      });
      it('should be responsed in xml format when given query.format = xml', function(done) {
        request
          .get('')
          .query({ format: 'xml' } )
          .parse(xml2jsParser)
          .buffer()
          .expect(200)
          .end(function(err, res) {
            res.body.response.should.have.properties({data: [{Hello: ['World']}]});
            done(err);
          });
      });
      it('should get res.status = 204, if the body is empty', function(done) {
        request
          .get('')
          .query({ empty: 'true'})
          .expect(204, done);
      });
      it('should get the ctrl by API exports.ctrl(ctrlName)', function(done) {
        request
          .get('')
          .query({ exports: '1'} )
          .expect(200)
          .end(function(err, res) {
            res.body.data.should.eql(true);
            done(err);
          });
      });
    });
    describe('POST /', function() {
      it('should get the ctrl by API ctx.ctrl(ctrlName)', function(done) {
        request
          .post('')
          .expect(200)
          .end(function(err, res) {
            res.body.data.should.eql(true);
            done(err);
          });
      });
    });
  });
  describe('/Items', function() {
    var ctrlName = this.title;
    describe('GET ' + ctrlName, function() {
      it('should get the model data', function(done) {
        request
          .get(ctrlName)
          .expect(200)
          .end(function(err, res) {
            res.body.data.should.eql(surface.models.items.index());
            done(err);
          });
      });
      it('should be responsed in xml format by API ctx.model()', function(done) {
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
    describe('POST ' + ctrlName, function() {
      describe('send post:true', function() {
        it('should get the data created by the own function of API ctx.model()', function(done) {
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
    describe('GET ' + ctrlName + '/:id', function() {
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
      describe('handle sub dir as well', function() {
        it('should get res.body = "in users"', function(done) {
          request
            .get(ctrlName)
            .expect(200)
            .expect('in users', done);
        });
      });
    });
    describe('/oauth', function() {
      describe('Do not accept json/xml', function() {
        it('should be responsed default conf.format', function(done) {
          request
            .get(ctrlName + '/auth/index')
            .accept('text/html')
            .expect(200)
            .end(function(err, res) {
              res.body.data.should.eql('in sub dir');
              done(err);
            });
        });
      });
      describe('POST /', function() {
        it('should get the data by API exports.model()', function(done) {
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
        it('should get the data by API exports.model(modelName)', function(done) {
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
        it('should handle sub sub dir as well', function(done) {
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
    describe('path without matching routes', function() {
      it('should get 404 status, GET', function(done) {
        request
          .get('/the/path/is/not/exist')
          .expect(404)
          .end(function(err, res) {
            res.body.should.have.properties(['request', 'code', 'msg']);
            done(err);
          });
      });
      it('should get 404 status, POST', function(done) {
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

describe('Customize response fields', function() {
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

describe('When the prefix is `true`', function() {
  var app = require('koa')()
    , surface = Surface(app, {
        root: './examples/simple/lib',
        prefix: true
      })
    , request = agent(app.callback())
    ;
  describe('and not match the url', function() {
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
  describe('and match the url', function() {
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
        .post('/api/1.0')
        .expect(200)
        .expect('not format', done)
    });
  });
});
describe('When the prefix is `String`', function() {
  var app = require('koa')()
    , surface = Surface(app, {
        root: './examples/simple/lib',
        prefix: '/v1'
      })
    , request = agent(app.callback())
    ;
  describe('and not match the url', function() {
    it('should not found without prefix', function(done) {
      request
        .get('')
        .expect(404, done);
    });
    it('should not format the response and get 404 status', function(done) {
      request
        .get('/the/path/is/not/exist')
        .expect(404)
        .expect('Not Found', done);
    });
  });
  describe('and match the url', function() {
    it('should format the response', function(done) {
      request
        .get('/v1')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties({data: {Hello: 'World'}});
          done(err);
        });
    });
  });
});
describe('When the prefix is `RegExp`', function() {
  var app = require('koa')()
    , surface = Surface(app, {
        root: './examples/simple/lib',
        prefix: /^\/v1/i
      })
    , request = agent(app.callback())
    ;
  describe('and not match the url', function() {
    it('should not found without prefix', function(done) {
      request
        .get('')
        .expect(404, done);
    });
    it('should not format the response and get 404 status', function(done) {
      request
        .get('/the/path/is/not/exist')
        .expect(404)
        .expect('Not Found', done);
    });
  });
  describe('and match the url', function() {
    it('should format the response', function(done) {
      request
        .get('/v1')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties({data: {Hello: 'World'}});
          done(err);
        });
    });
  });
});
describe('When the prefix is `String` and `prefixPattern` is given', function() {
  var app = require('koa')()
    , surface = Surface(app, {
        root: './examples/simple/lib',
        prefix: '/v1',
        prefixPattern: /\/api\/v1/
      })
    , request = agent(app.callback())
    ;
  it('should not format the response', function(done) {
    request
      .get('/v1')
      .expect(200)
      .end(function(err,res) {
        res.body.should.not.have.properties(['data']);
        done(err);
      });
  });
});
describe('Need be authenticated', function() {
  describe('with wrong options setting', function() {
    var app = require('koa')()
      , surface = Surface(app, {
          root: './examples/simple/lib',
          authenticate: function() {},
          deny: function() {}
        })
      , request = agent(app.callback())
      ;
    it('should still work well by default setting', function(done) {
      request
        .get('/api/1.0')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties({data: '1.0'});
          done(err);
        });
    });
  });
  describe('when request URLs match the default pattern', function() {
    var app = require('koa')()
      , surface = Surface(app, {
          root: './examples/simple/lib',
          authenticate: function *() {
            if (this.method === 'GET') {
              return true;
            } else {
              return false;
            }
          },
          deny: function*() {
            this.status = 401;
          }
        })
      , request = agent(app.callback())
      ;
    it('should be authenticated when GET', function(done) {
      request
        .get('/api/1.0')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties({data: '1.0'});
          done(err);
        });
    });
    it('should be denied when POST', function(done) {
      request
        .post('/api/1.0')
        .expect(401, done)
        ;
    });
  });
  describe('when request URLs match the options pattern', function() {
    var app = require('koa')()
      , surface = Surface(app, {
          root: './examples/simple/lib',
          authenticate: function *() {
            if (this.method === 'GET') {
              return true;
            } else {
              return false;
            }
          },
          deny: function*() {
            this.status = 401;
          },
          authenticatePattern: /^\/api|^\/users/i
        })
      , request = agent(app.callback())
      ;
    it('should be authenticated when GET', function(done) {
      request
        .get('/api/1.0')
        .expect(200)
        .end(function(err, res) {
          res.body.should.have.properties({data: '1.0'});
          done(err);
        });
    });
    it('should be denied when POST', function(done) {
      request
        .post('/users/auth/')
        .expect(401, done)
        ;
    });
  });
});
describe('Use Customize Status Message', function() {
  var app = require('koa')()
    , surface = Surface(app, {root: './examples/simple/lib'})
    , request = agent(app.callback())
    ;
  it('should get the customize message by this.statusMessage', function(done) {
    request
      .get('/users/login')
      .expect(440)
      .end(function(err, res) {
        res.res.statusMessage.should.eql('Login Please');
        done(err);
      });
  });
  it('should get the default message', function(done) {
    request
      .post('/users/login')
      .expect(200)
      .expect(/ok/, done);
  });
});