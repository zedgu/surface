var parser = require('co-body')
  ;

exports.index = function *(next) {
  if (this.query.empty) {
    this.body = '';
  } else {
    this.body = {Hello: 'World'};
  }
  yield next;
};
