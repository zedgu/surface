var request = require('superagent')
  , app = require('koa')()
  , Surface = require('..')
  ;

var surface = Surface(app, {root: './examples/simple/lib'});
app.listen(3030);

describe('Surface Testing', function(){
  describe('Surface(app, {root: "./examples/simple/lib"})', function() {
    it('should get a instance of surface and have properties "_conf", "conf", "_format"', function() {
      surface.should.be.an.instanceOf(Surface).and.have.properties(["_conf", "conf", "_format"]);
    });
    it('should be set with new root path "./examples/simple/lib"', function() {
      surface.conf.root.should.eql("./examples/simple/lib");
    });
  });
  describe('#setting()', function() {
    it('should return an object, no matter what type param you put', function() {
      surface.setting(null).should.be.an.Object;
      surface.setting('').should.be.an.Object;
      surface.setting(undefined).should.be.an.Object;
      surface.setting(false).should.be.an.Object;
      surface.setting(function(){}).should.be.an.Object;    
    });
    it('should always have properties ["root", "ctrl", "model", "format", "multiple", "routes"]', function() {
      surface.setting(null).should.have.properties(["root", "ctrl", "model", "format", "multiple", "routes"]);
    });
    it('should get correct format and other defaultSetting', function() {
      surface.setting({root: 'a', ctrl: 'b', model: 'c', format: 'd'}).should.have.properties({
        root: 'a',
        ctrl: 'b',
        model: 'c',
        format: 'json',
        multiple: false,
        routes: {
          'index': {
            method: 'get',
            path: ''
          },
          'create': {
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
        }
      });
    });
  });
  describe('#load()', function() {
    it('should load lib/controllers/* and return an object of the paths', function() {
      surface.load('ctrl').should.be.an.Object;
    });
  });
});
