var jwt = require("jsonwebtoken");
require("dotenv").config();

//generate jwt auth token 
exports.getToken = function (user) {
  const userIdentity = {
    id: user._id,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(userIdentity, process.env.TOKEN_SECRET, { expiresIn: 3600 });
};

//verify logged in user token
exports.verifyToken = (req, res, next) => {
  let authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).send({
      message: "Authorization failed!",
    });
  }

  let bearer = authHeader.split(" ");
  let token = bearer[1];

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    next();
  });
};

//verify the user is admin or normal user
exports.isAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    res.status(403).send({
      message: "Require Admin Role!",
    });
  }
  next();
};
