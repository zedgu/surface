exports.index = function *() {
  this.body = '1.0';
};

exports.create = function *() {
  this.body = 'not format';
  this.skip_surface = true;
};