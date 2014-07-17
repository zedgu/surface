exports.index = function *(next) {
  this.body = 'in /users/info';
  yield next;
};