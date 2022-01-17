const express = require("express");
const mediaRouter = express.Router();
const multer = require("multer");
var userAuth = require("../middlewares/userAuth");
const utils = require("../helpers/utils");
const Media = require("../models/media.model");
const fs = require("fs");
const { access, unlink } = require("fs/promises");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    var ext = utils.getFileExtension(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});

const uploadFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("You can upload only image files"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: uploadFilter });

mediaRouter
  .route("/")
  .get(userAuth.verifyToken, async (req, res, next) => {
    try {
      const userMedias = await Media.find({ author: req.userId });
      res.status(200).json(userMedias);
    } catch (error) {
      res.json(error);
    }
  })
  .post(userAuth.verifyToken, upload.single("myfile"), async (req, res) => {
    const file = req.file;

    if (!file) return res.status(400).json("Please upload a file");
    const media = new Media({
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      author: req.userId,
    });
    let uploadedMedia = await media.save();
    if (!uploadedMedia)
      return res.status(403).json("Failed to create blog post");
    res.status(200).json(uploadedMedia);
  })
  .put(async (req, res, next) => {
    res.status(403).json("PUT operation not supported");
  })
  .delete(async (req, res, next) => {
    res.status(403).json("DELETE operation not supported");
  });

mediaRouter
  .route("/:mediaId")
  .get(userAuth.verifyToken, async (req, res, next) => {
    try {
      //get single media files
      const singleMedia = await Media.findById(req.params.mediaId);
      res.status(200).json(singleMedia);
    } catch (error) {
      res.json(error);
    }
  })
  .post(userAuth.verifyToken, async (req, res) => {
    res.status(403).json("PUT operation not supported");
  })
  .put(async (req, res, next) => {
    res.status(403).json("PUT operation not supported");
  })
  .delete(userAuth.verifyToken, async (req, res, next) => {
    try {
      const singleMedia = await Media.findById(req.params.mediaId);
      if (!singleMedia) return res.status(404).json("File not found");

      await access(singleMedia.filePath, fs.F_OK | fs.W_OK);
      await unlink(singleMedia.filePath);

      await Media.deleteOne({ _id: req.params.mediaId });

      res.status(200).json("file deleted successfully");
    } catch (error) {
      res.json(error);
    }
  });

module.exports = mediaRouter;
