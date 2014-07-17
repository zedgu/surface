exports.alias = 'auth';
exports.routes = {
  entry: {
    method: 'get',
    path: '/index'
  }
}
exports.entry = function *(next) {
  this.body = 'in sub dir';
  yield next;
};