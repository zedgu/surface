exports.alias = 'auth';
exports.routes = {
  entry: {
    method: 'get',
    path: '/index'
  },
  post: {
    method: 'post',
    path: '/'
  },
  get: {
    method: 'post',
    path: '/:id'
  }
}
exports.entry = function *(next) {
  this.body = 'in sub dir';
  yield next;
};

var self = exports;
exports.post = function *(next) {
  this.body = self.model().index();
  yield next;
};
exports.get = function *(next) {
  this.body = self.model('items').index();
  yield next;
}
