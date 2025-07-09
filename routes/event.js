const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const verifySession = require("../middlewares/verifySession");


// Admin creates event
router.post("/create", async (req, res) => {
  try {
    const { etitle, description, date, price,location, participationFee } = req.body;

    if (!etitle || !date || !price || !participationFee) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const event = await Event.create({ etitle, description, date, price,location ,participationFee});
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Public: get all events
router.get("/all", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});
// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET a single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the event", error });
  }
});

router.delete('/:id', verifySession, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});


module.exports = router;

