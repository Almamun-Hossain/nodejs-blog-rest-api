var express = require("express");
var userRouter = express.Router();
var userAuth = require("../middlewares/userAuth");
var User = require("../models/user.model");
/* GET users listing. */
userRouter
  .route("/")
  .get(userAuth.verifyToken, userAuth.isAdmin, async (req, res, next) => {
    try {
      let users = await User.find({});
      if (!users) return res.status(404).send("there is no users found");
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  })
  .post(userAuth.verifyToken, userAuth.isAdmin, async (req, res, next) => {
    res.status(403).end("POST operation not supported");
  })
  .put(userAuth.verifyToken, userAuth.isAdmin, async (req, res, next) => {
    res.status(403).end("PUT operation not supported");
  })
  .delete(userAuth.verifyToken, userAuth.isAdmin, async (req, res, next) => {
    res.status(403).end("DELETE operation not supported");
  });

userRouter
  .route("/:uid")
  .get(userAuth.verifyToken, async (req, res, next) => {
    try {
      let user = await User.findById(req.params.uid);
      if (!user) return res.status(404).send("User not found");
      const { password, __v, ...others } = user._doc;
      res.status(200).json(others);
    } catch (error) {
      next(error);
    }
  })
  .post(userAuth.verifyToken, async (req, res, next) => {
    res.status(403).end("POST operation not supported");
  })
  .put(userAuth.verifyToken, async (req, res, next) => {
    try {
      if (!(req.params.uid === req.userId)) return res.send(403);
      let user = await User.findByIdAndUpdate(
        req.params.uid,
        { $set: req.body },
        { new: true }
      );
      const { password, __v, ...others } = user._doc;
      res.status(200).json(others);
    } catch (error) {
      next(error);
    }
  })
  .delete(userAuth.verifyToken, async (req, res, next) => {
    try {
      if (!(req.params.uid === req.userId)) return res.send(403);
      let deleted = await User.findByIdAndRemove(req.params.uid);
      res.status(200).json(deleted);
    } catch (error) {
      next(error);
    }
  });

module.exports = userRouter;
