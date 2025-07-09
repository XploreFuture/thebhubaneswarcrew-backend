const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  etitle: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  location: {
    type: String,
    required: true,
  },
  price: { type: Number, required: true },
  createdBy: { type: String, default: "admin" },
  // models/Event.js
participationFee: {
  type: Number,
  required: true,
  default: 0
}

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
