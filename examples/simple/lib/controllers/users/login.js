exports.index = function *() {
  this.status = 401;
  this.statusMessage = 'Login Please';
};

exports.create = function *() {
  this.body = 'ok';
};