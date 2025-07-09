const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String }, // optional
  contentTitle: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
}, { timestamps: true });

reviewSchema.index({ userId: 1, contentTitle: 1 }, { unique: true }); // one review per content per user

module.exports = mongoose.model("Review", reviewSchema);
