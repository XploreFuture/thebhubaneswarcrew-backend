const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const verifySession = require('../middlewares/verifySession');
const Ticket = require('../models/Ticket');
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

// Create Razorpay order
router.post('/checkout/:eventId', verifySession, async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).send('Event not found');

  const options = {
    amount: event.price * 100, // Convert to paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  const ticket = new Ticket({
    userUid: req.uid,
    eventId: event._id,
    orderId: order.id,
    status: 'created',
  });
  await ticket.save();

  res.json({ order, event });
});

// Verify Razorpay signature and mark ticket as paid
router.post('/verify', verifySession, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const ticket = await Ticket.findOne({ orderId: razorpay_order_id });
  if (!ticket) return res.status(404).send('Ticket not found');

  ticket.paymentId = razorpay_payment_id;
  ticket.status = 'paid';
  await ticket.save();

  res.json({ success: true, ticketId: ticket._id }); // ✅ send ticketId
});


router.get("/download/:ticketId", verifySession, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId).populate("eventId");
    if (!ticket || ticket.userUid !== req.uid) {
      return res.status(404).json({ message: "Ticket not found or unauthorized" });
    }

    const user = await User.findOne({ uid: req.uid });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=ticket-${ticket._id}.pdf`);
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
      .text(" Event Ticket", 0, 150, { align: "center" });

    // 📅 Event Details
    doc
      .fontSize(14)
      .fillColor("black")
      .text(`Event: ${ticket.eventId.etitle}`, 60, 200)
      .text(`Date: ${new Date(ticket.eventId.date).toLocaleDateString()}`)
      .text(`Location: ${ticket.eventId.location}`);

    // 👤 User Details
    doc
      .text(`Name: ${user?.fullName || "N/A"}`)
      .text(`Email: ${user?.email || "N/A"}`)
      .text(`Booked On: ${new Date(ticket.createdAt).toLocaleString()}`);

    // 🔖 Ticket ID
    doc
      .fontSize(12)
      .fillColor("#666")
      .text(`Ticket ID: ${ticket._id}`, 60, 420);

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

router.get("/:id", verifySession, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("eventId");
    if (!ticket || ticket.userUid !== req.uid) {
      console.warn("Unauthorized access attempt. Ticket UID:", ticket?.userUid, "Expected:", req.uid);
      return res.status(403).json({ message: "Unauthorized access to this ticket" });
    }
    const user = await User.findOne({ uid: ticket.userUid });
    const ticketWithUser = {
      ...ticket.toObject(),
      user: {
        fullName: user?.fullName || "Unknown User",
        email: user?.email || "Unknown Email",
      },
    };

    res.json(ticketWithUser);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ message: "Server error fetching ticket" });
  }
});

// GET all tickets of current user




module.exports = router;
