// models/Content.js
const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: [
    {
      heading: { type: String, required: true },
      body: { type: String, required: true },
      image : { type: String, required: false }
    },
  ],
  author: {
    type: String,
    default: "Thebhubaneswarcrew", // can be uid or string label
  },
}, { timestamps: true });

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
