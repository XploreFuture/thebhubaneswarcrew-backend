const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userUid: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  orderId: String,
  paymentId: String,
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
},{ timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
