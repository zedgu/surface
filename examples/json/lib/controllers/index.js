exports.index = function *(next) {
  this.body = 'Hello World!';
  yield next;
};