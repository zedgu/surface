var app = require('koa')()
  , Surface = require('..')
  ;

describe('Surface Testing', function(){
  describe('Surface(app, {root: "./examples/simple/lib"})', function() {
    var surface = Surface(app, {root: './examples/simple/lib'});
    it('should not get a instance of surface and have properties "conf", "ctrls", "models"', function() {
      surface.should.not.be.an.instanceOf(Surface).and.have.properties(["conf", "ctrls", "models"]);
    });
    it('should be set with new root path "./examples/simple/lib"', function() {
      surface.conf.root.should.eql("./examples/simple/lib");
    });
    it('should get items model of surface.models', function() {
      surface.models.items.should.be.an.Object;
    });
    it('should load all models', function() {
      surface.models.should.have.properties(['users/oauth', 'items', 'categories']);
    });
  });
  describe('#setting()', function() {
    it('should return an object, no matter what type param you put', function() {
      Surface(app, null).conf.should.be.an.Object;
      Surface(app, '').conf.should.be.an.Object;
      Surface(app, undefined).conf.should.be.an.Object;
      Surface(app, false).conf.should.be.an.Object;
      Surface(app, function(){}).conf.should.be.an.Object;    
    });
    it('should always have properties ["root", "ctrl", "model", "format", "routes", "aliases"]', function() {
      Surface(app, null).conf.should.have.properties(["root", "ctrl", "model", "format", "routes", "aliases"]);
    });
    it('should get correct format and other defaultSetting', function() {
      Surface(app, {root: 'a', ctrl: 'b', model: 'c', format: 'd'}).conf.should.have.properties({
        root: 'a',
        ctrl: 'b',
        model: 'c',
        format: 'json',
        routes: {
          'index': {
            method: 'get',
            path: ''
          },
          'create': {
            method: 'post',
            path: ''
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
          index: ''
        }
      });
    });
  });
  describe('#load()', function() {
    it('should load dirpath which is not exist with no err and return an object {}', function() {
      Surface(app, {root: 'a', ctrl: 'b'}).ctrls.should.eql({}, 'need {}');
    });
    it('should load files in sub dirs', function() {
      Surface(app, {root: './examples/simple/lib'}).ctrls.should.have.properties(['index', 'items', 'users/oauth', 'users/info/mail']);
    });
  });
});
