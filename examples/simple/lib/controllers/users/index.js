exports.index = function *(next) {
  this.body = 'in users';
  yield next;
};