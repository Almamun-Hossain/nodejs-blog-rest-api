const bcrypt = require("bcrypt");

exports.encryptPassowrd = async (password) => {
  const salt = await bcrypt.genSalt(12);
  const hashPass = await bcrypt.hash(password, salt);
  return hashPass;
};

exports.comparePassword = async (password, hashPassword) => {
  return (compare = await bcrypt.compare(password, hashPassword));
};
