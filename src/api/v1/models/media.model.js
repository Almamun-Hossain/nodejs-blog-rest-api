const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Media = mongoose.model("media", mediaSchema);
module.exports = Media;
