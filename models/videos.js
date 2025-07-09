const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ["youtube", "instagram"],
    required: true,
  },
  videoId: {
    type: String,
    required: true,
    trim: true,
  },
  vtitle: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Video", videoSchema);
