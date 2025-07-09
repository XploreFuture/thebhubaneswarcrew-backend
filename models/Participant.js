const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  userUid: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  orderId: { type: String, required: true },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Participant", participantSchema);
