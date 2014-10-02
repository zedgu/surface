exports.index = function *() {
  this.res.statusCode = 440;
  this.res.statusMessage = 'Login Please';    
};

exports.create = function *() {
  this.body = 'ok';
};