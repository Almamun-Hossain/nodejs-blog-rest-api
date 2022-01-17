var express = require("express");
const req = require("express/lib/request");
var signInUpRouter = express.Router();
var User = require("../models/user.model");
var HashPassword = require("../helpers/hashPassword");
const { token } = require("morgan");

const UserAuth = require("../middlewares/userAuth");

const UserServices = require("../services/user.services");

//user login
signInUpRouter.post("/signin", async (req, res, next) => {
  const { email, pass } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).send("User doesn't exist");

    const comparePassword = await HashPassword.comparePassword(
      pass,
      user.password
    );
    if (!comparePassword) return res.status(401).send("Incorrect password");
    const { password, __v, ...others } = user._doc;
    const token = UserAuth.getToken(others);
    res.json({
      success: true,
      token: token,
      status: "You have successfully logged in",
    });
  } catch (error) {
    next(error);
  }
});

//user register
signInUpRouter.post("/signup", async (req, res, next) => {
  var { firstName, lastName, email, password } = req.body;
  try {
    const hashPass = await HashPassword.encryptPassowrd(password);
    const regUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashPass,
    });

    const isUserExist = await UserServices.isUserExist(email);

    if (isUserExist) return res.send("User already exist");

    const register = await regUser.save();
    if (!register) return res.send("User registration failed");
    res.status(200).json(register);
  } catch (error) {
    next(error);
  }
});

module.exports = signInUpRouter;
