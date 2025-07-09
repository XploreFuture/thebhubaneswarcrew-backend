const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const verifySession = require('../middlewares/verifySession');
const Participant = require('../models/Participant');
const Event = require('../models/Event');
const PDFDocument = require("pdfkit");
const User = require('../models/User');
const path = require('path');
const fs = require("fs");


const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order for participant
router.post('/checkout/:eventId', verifySession, async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).send('Event not found');

  const options = {
    amount: event.participationFee * 100, // Convert to paise
    currency: 'INR',
    receipt: `participant_receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  const participant = new Participant({
    userUid: req.uid,
    eventId: event._id,
    orderId: order.id,
    status: 'created',
  });
  await participant.save();

  res.json({ order, event });
});

// Verify Razorpay signature and mark participant as paid
router.post('/verify', verifySession, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const participant = await Participant.findOne({ orderId: razorpay_order_id });
  if (!participant) return res.status(404).send('Participant not found');

  participant.paymentId = razorpay_payment_id;
  participant.status = 'paid';
  await participant.save();

  res.json({ success: true, participantId: participant._id });
});

// Generate PDF for participant
router.get("/download/:participantId", verifySession, async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.participantId).populate("eventId");
    if (!participant ||participant.userUid !== req.uid) {
      return res.status(404).json({ message: "Ticket not found or unauthorized" });
    }

    const user = await User.findOne({ uid: req.uid });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=participant-${participant._id}.pdf`);
    doc.pipe(res);

    // 🖼️ Add logo (make sure logo.png exists in assets folder)
    const logoPath = path.join(__dirname, "../assets/bbsrcrew.png");
    doc.image(logoPath, 50, 50, { width: 80 });

    doc
  .font("Helvetica-Bold")
  .fontSize(24)
  .fillColor("#333")
  .text("The Bhubaneswar Crew", 120, 65);

    // 🟫 Card-style container
    doc.roundedRect(40, 130, 520, 300, 10).fillAndStroke("#f5f5f5", "#ccc");

    // 🎟️ Heading
    doc
      .fontSize(20)
      .fillColor("#333")
      .text(" Participation", 0, 150, { align: "center" });

    // 📅 Event Details
    doc
      .fontSize(14)
      .fillColor("black")
      .text(`Event: ${participant.eventId.etitle}`, 60, 200)
      .text(`Date: ${new Date(participant.eventId.date).toLocaleDateString()}`)
      .text(`Location: ${participant.eventId.location}`);

    // 👤 User Details
    doc
      .text(`Name: ${user?.fullName || "N/A"}`)
      .text(`Email: ${user?.email || "N/A"}`)
      .text(`Booked On: ${new Date(participant.createdAt).toLocaleString()}`);

    // 🔖 Ticket ID
    doc
      .fontSize(12)
      .fillColor("#666")
      .text(`Participatnt ID: ${participant._id}`, 60, 420);

    // 👣 Footer
    doc
      .fontSize(10)
      .fillColor("#aaa")
      .text("Powered by The BBSR Crew", { align: "center" });

    doc.end();
  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ message: "Failed to generate ticket PDF" });
  }
});

// Get participant details
router.get("/:id", verifySession, async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id).populate("eventId");
    if (!participant || participant.userUid !== req.uid) {
      return res.status(403).json({ message: "Unauthorized access to this participant" });
    }
    const user = await User.findOne({ uid: participant.userUid });
    const participantWithUser = {
      ...participant.toObject(),
      user: {
        fullName: user?.fullName || "Unknown User",
        email: user?.email || "Unknown Email",
      },
    };

    res.json(participantWithUser);
  } catch (err) {
    console.error("Error fetching participant:", err);
    res.status(500).json({ message: "Server error fetching participant" });
  }
});

module.exports = router;
