exports.index = function *() {
  this.body = '';   
  this.res.statusCode = 440;
  this.res.statusMessage = 'Login Please';
};

exports.create = function *() {
  this.body = 'ok';
};