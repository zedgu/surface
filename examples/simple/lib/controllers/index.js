var parser = require('co-body')
  ;

exports.index = function *() {
  if (this.query.empty) {
    this.body = '';
  } else {
    this.body = {Hello: 'World'};
  }
};
