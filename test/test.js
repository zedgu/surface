var should = require('should')
  , request = require('superagent')
  , app = require('koa')()
  , Surface = require('..')
  ;

var surface = Surface(app, {root: './examples/json/lib'});
app.listen(3030);

describe('surface', function(){
  it('should get a instance of surface an have same properties', function() {
    surface.should.be.an.instanceOf(Surface).and.have.properties(['_conf', 'conf', '_format']);
  });
  describe('#setting()', function() {
    it('should return an object', function() {
      surface.setting(null).should.be.an.Object;
      surface.setting('').should.be.an.Object;
      surface.setting(undefined).should.be.an.Object;
      surface.setting(false).should.be.an.Object;
      surface.setting(function(){}).should.be.an.Object;    
    });
    it('should have properties [root, ctrl, model, format, multiple, routers]', function() {
      surface.setting({}).should.have.properties(['root', 'ctrl', 'model', 'format', 'multiple', 'routes']);
    });
    it('should get right format and other defaultSetting', function() {
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
          'new': {
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
    it('should load json/lib/controllers/* and return an object of paths', function() {
      surface.load('ctrl').should.be.an.Object;
    });
  });
});
