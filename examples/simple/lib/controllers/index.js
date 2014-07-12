var parser = require('co-body');

exports.index = function *(next) {
  if (this.query.empty) {
    this.body = '';
  } else {
    this.body = {Hello: 'World'};
  }
  yield next;
};
exports.get = function *(next) {
  this.body = {id: this.params.id};
  yield next;
};
exports.create = function *(next) {
  var body = yield parser(this.req);

  if (body.post === 'true') {
    this.body = 'new';
  }

  yield next;
}
