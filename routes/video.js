const express = require("express");
const router = express.Router();
const Video = require("../models/videos");
const verifySession = require("../middlewares/verifySession");

// GET all videos (optionally by location)
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;
    const videos = location
      ? await Video.find({ location })
      : await Video.find();
    res.json(videos);
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

// POST - Add new video (admin only)
router.post("/add", verifySession, async (req, res) => {
  try {
    const { platform, videoId, vtitle, location } = req.body;
    const newVideo = new Video({
      platform,
      videoId,
      vtitle,
      location,
    });
    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (err) {
    console.error("Error adding video:", err);
    res.status(400).json({ message: "Failed to add video" });
  }
});

// PUT - Update video (admin only)
router.put("/:id", verifySession, async (req, res) => {
  try {
    const updated = await Video.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Error updating video:", err);
    res.status(500).json({ message: "Failed to update video" });
  }
});

// DELETE - Remove video (admin only)
router.delete("/:id", verifySession, async (req, res) => {
  try {
    const deleted = await Video.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error("Error deleting video:", err);
    res.status(500).json({ message: "Failed to delete video" });
  }
});
router.get("/location/:location", async (req, res) => {
  try {
    const videos = await Video.find({ location: req.params.location });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});


module.exports = router;
