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
exports.entry = function *() {
  this.body = 'in sub dir';
};

exports.post = function *() {
  this.body = exports.model().index();
};
exports.get = function *() {
  this.body = exports.model('items').index();
}
