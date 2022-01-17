var User = require("../models/user.model");

exports.isUserExist = async (email) => {
  const user = await User.findOne({ email: email });
  if (!user) return false;
  return true;
};
