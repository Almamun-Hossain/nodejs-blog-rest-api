const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");
const commentSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    versionKey: false,
  },
  { timestamps: true }
);

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: function genSlug() {
        return slugify(this.title.toLowerCase());
      },
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    thumbnail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "media",
      required: true,
    },
    metaDescription: {
      type: String,
      default: null,
    },
    metaTag: {
      type: String,
      default: null,
    },
    comment: [commentSchema],
  },
  { timestamps: true }
);

const Blog = mongoose.model("blog", blogSchema);
module.exports = Blog;
