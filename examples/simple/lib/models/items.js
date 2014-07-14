module.exports = {
  data: {
    "a": "A",
    "b": "B"
  },
  create: function(key, value) {
    this.data[key] = value;
    return this.get(key);
  },
  index: function() {
    return this.data;
  },
  get: function(key) {
    return this.data[key];
  }
};