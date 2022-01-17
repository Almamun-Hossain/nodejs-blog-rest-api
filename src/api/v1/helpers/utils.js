const path = require("path");
exports.getFileExtension = (name) => {
  return path.extname(name).slice(1);
};
