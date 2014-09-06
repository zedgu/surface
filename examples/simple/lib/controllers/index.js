exports.index = function *() {
  if (this.query.empty) {
    this.body = '';
  } else {
    this.body = {Hello: 'World'};
  }
  if (this.query.exports) {
    this.body = exports.ctrl() === exports.ctrl('index');
  }
};

exports.create = function *() {
  this.body = this.ctrl() === exports;
};
