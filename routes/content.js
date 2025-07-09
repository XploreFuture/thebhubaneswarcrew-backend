const express = require("express");
const verifySession = require("../middlewares/verifySession");
const Content = require("../models/Content");
const router = express.Router();

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") return next();
  return res.status(403).send("Forbidden");
};

// Add content
router.post("/add", verifySession, isAdmin, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newContent = await Content.create({
      title,
      content,
      author: req.user.uid
    });
    res.json(newContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public content fetch
router.get("/all", async (req, res) => {
  const contents = await Content.find().sort({ createdAt: -1 });
  res.json(contents);
});

router.get("/get-by-title/:title", async (req, res) => {
  try {
    const title = decodeURIComponent(req.params.title);
    const content = await Content.findOne({ title });
    if (!content) return res.status(404).json({ message: "Content not found" });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
