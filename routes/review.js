const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const verifySession = require("../middlewares/verifySession");


// Add review
router.post("/add", verifySession, async (req, res) => {
    const { contentTitle, rating, comment } = req.body;
    const { uid, email, name } = req.user;
  
    try {
      const existing = await Review.findOne({ userId: uid, contentTitle });
      if (existing) return res.status(400).json({ message: "Already reviewed" });
  
      const review = new Review({
        userId: uid,
        userName: name,
        contentTitle,
        rating,
        comment,
      });
  
      await review.save();
      res.json({ message: "Review submitted" });
    } catch (err) {
      res.status(500).json({ message: "Error submitting review", error: err });
    }
  });
  

// Get all reviews for a content
router.get("/:contentTitle", async (req, res) => {
  try {
    const reviews = await Review.find({ contentTitle: decodeURIComponent(req.params.contentTitle) });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

module.exports = router;
