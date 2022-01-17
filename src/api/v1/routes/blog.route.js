var express = require("express");
var blogRouter = express.Router();
var userAuth = require("../middlewares/userAuth");
var Blog = require("../models/blog.model");

//working with all blog post
blogRouter
  .route("/")
  .get(async (req, res, next) => {
    try {
      const limit = 10;

      var { page = 1 } = req.query;
      if (page <= 0) return res.status(403).json("Invalid page request");
      let blogs = await Blog.find()
        .populate("author", "firstName lastName isAdmin")
        .populate("thumbnail")
        .limit(limit)
        .skip((page - 1) * limit);
      if (blogs.length <= 0)
        return res.status(404).json("There is no blog found");
      res.status(200).json(blogs);
    } catch (error) {
      next(error);
    }
  })
  .post(userAuth.verifyToken, async (req, res, next) => {
    try {
      let blog = new Blog({
        author: req.userId,
        ...req.body,
      });

      let created = await blog.save();
      if (!created) return res.status(403).json("Failed to create blog post");
      res.status(200).json(created);
    } catch (error) {
      next(error);
    }
  })
  .put(userAuth.verifyToken, async (req, res, next) => {
    res.status(403).end("PUT operation not supported");
  })
  .delete(userAuth.verifyToken, userAuth.isAdmin, async (req, res, next) => {
    res.status(403).end("DELETE operation not supported");
  });

//working with single blog post
blogRouter
  .route("/:blogId")
  .get(async (req, res, next) => {
    try {
      let blog = await Blog.findById(req.params.blogId)
        .populate("author", "firstName lastName isAdmin")
        .populate("thumbnail");
      if (!blog) return res.status(404).json("Blog not found");
      res.status(200).json(blog);
    } catch (err) {
      next(err);
    }
  })
  .post(userAuth.verifyToken, async (req, res, next) => {
    res.statusCode = 403;
    res.json("POST operation not supported");
  })
  .put(userAuth.verifyToken, async (req, res, next) => {
    try {
      let blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json("Blog not found");
      if (blog.author.toString() !== req.userId)
        return res
          .status(403)
          .json("You are not authorize to udpate this blog");

      let updateBlog = await Blog.findByIdAndUpdate(
        req.params.blogId,
        { $set: req.body },
        { new: true }
      )
        .populate("author", "firstName lastName isAdmin")
        .populate("thumbnail");
      res.status(200).json(updateBlog);
    } catch (err) {
      next(err);
    }
  })
  .delete(userAuth.verifyToken, async (req, res, next) => {
    let blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json("Blog not found");
    if (blog.author.toString() !== req.userId)
      return res.status(403).json("You are not authorize to delete this blog");

    let deleteBlog = await Blog.deleteOne({ __id: req.params.blogId });
    res.status(200).json(deleteBlog);
  });

//working will single blog comments
blogRouter
  .route("/:blogId/comment")
  .get(async (req, res, next) => {
    try {
      let blog = await Blog.findById(req.params.blogId).populate(
        "comment.author",
        "firstName lastName isAdmin"
      );
      if (!blog) return res.status(404).json("Blog not found");

      let comments = blog.comment;
      console.log(comments);
      if (comments.length <= 0)
        return res.status(404).json("there is no comments found");
      res.status(200).json(comments);
    } catch (err) {
      next(err);
    }
  })
  .post(userAuth.verifyToken, async (req, res, next) => {
    try {
      let blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json("Blog not found");

      let comments = blog.comment;
      const comment = {
        author: req.userId,
        ...req.body,
      };

      comments.push(comment);
      let updatedBlog = await blog.save();
      if (!updatedBlog)
        return res.status(503).json("Failed to do post comment");

      res.status(200).json(comments);
    } catch (err) {
      next(err);
    }
  })
  .put(userAuth.verifyToken, async (req, res, next) => {
    res.status(403).json("put operation not supported");
  })
  .delete(userAuth.verifyToken, userAuth.isAdmin, async (req, res, next) => {
    res.status(403).json("DELETE operation not supported");
  });

//working with specific comment from a specific blog
blogRouter
  .route("/:blogId/comment/:commentId")
  .get(async (req, res, next) => {
    try {
      let blog = await Blog.findById(req.params.blogId).populate(
        "comment.author",
        "firstName lastName isAdmin"
      );
      if (!blog) return res.status(404).json("Blog not found");
      if (blog.comment.id(req.params.commentId) == null)
        return res.status(404).json("comment not found");
      res.json(blog.comment.id(req.params.commentId));
    } catch (err) {
      next(err);
    }
  })
  .post(userAuth.verifyToken, async (req, res, next) => {
    res.status(403).json("POST operation not supported");
  })
  .put(userAuth.verifyToken, async (req, res, next) => {
    try {
      var blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json("Blog not found");
      if (blog.comment.id(req.params.commentId) == null)
        return res.status(404).json("comment not found");

      if (
        req.userId !== blog.comment.id(req.params.commentId).author.toString()
      )
        return res
          .status(403)
          .json("You are not athorize to update this comment");

      if (req.body.comment) {
        blog.comment.id(req.params.commentId).comment = req.body.comment;
      }

      let save = await blog.save();
      if (!save) return res.json("Failed to update comment");

      blog = await Blog.findById(req.params.blogId).populate(
        "comment.author",
        "firstName lastName isAdmin"
      );

      res.json(blog.comment.id(req.params.commentId));
    } catch (err) {
      next(err);
    }
  })
  .delete(userAuth.verifyToken, async (req, res, next) => {
    try {
      var blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json("Blog not found");
      if (blog.comment.id(req.params.commentId) == null)
        return res.status(404).json("comment not found");

      if (
        req.userId !== blog.comment.id(req.params.commentId).author.toString()
      )
        return res
          .status(403)
          .json("You are not athorize to delete this comment");

      blog.comment.id(req.params.commentId).remove();
      let save = await blog.save();
      if (!save) return res.json("Failed to delete the comment");
      blog = await Blog.findById(req.params.blogId).populate(
        "comment.author",
        "firstName lastName isAdmin"
      );

      res.json(blog);
    } catch (err) {
      next(err);
    }
  });

module.exports = blogRouter;
