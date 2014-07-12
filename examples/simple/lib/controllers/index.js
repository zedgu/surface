exports.index = function *(next) {
  this.body = 'Hello World!';
  yield next;
};
exports.get = function *(next) {
  this.body = '';
  yield next;
};