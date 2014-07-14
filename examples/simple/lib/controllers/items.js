var parser = require('co-body')
  ;

exports.index = function *(next) {
  this.body = this.model().index();
  yield next;
};
exports.get = function *(next) {
  this.body = this.model().get(this.params.id);
  yield next;
};
exports.create = function *(next) {
  var body = yield parser(this.req);

  for (var key in body) {
    this.body = this.model().create(key, body[key]);
  }

  yield next;
};
