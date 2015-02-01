var fs = require('fs');
var path = require('path');

module.exports = function(root, paths) {
  var files = loadfiles(path.join(root, '/', paths));
  var obj = {};

  for (var file in files) {
    obj[file.toLowerCase()] = require(files[file]);
  }

  return obj;
};

/**
 * to load files
 * @param  {String} root    root path
 * @param  {String} subPath sub dir path
 * @param  {Object} paths   dictionary of the paths
 * @return {Object}         dictionary of the paths
 * @api private
 */
function loadfiles(root, subPath, paths) {
  var dirPath = path.resolve(subPath || root)
    , subPath = subPath ? path.basename(subPath) + '/' : ''
    , paths = paths || {}
    , files
    ;
  try {
    files = fs.readdirSync(dirPath)
  } catch(e) {
    files = [];
  }
  files.forEach(function(file) {
    file = path.join(dirPath, '/', file);
    if (fs.statSync(file).isFile()) {
      if (path.extname(file) === '.js') {
        paths[file.replace(new RegExp('^' + path.resolve(root) + '/'), '').replace(/.js$/, '').toLowerCase()] = file;
      }
    } else if (fs.statSync(file).isDirectory()) {
      loadfiles(root, file, paths);
    }
  });
  return paths;
}
