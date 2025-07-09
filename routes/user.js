const express = require("express");
const verifySession = require("../middlewares/verifySession");
const router = express.Router();
const User = require("../models/User");


router.get("/profile", verifySession, async (req, res) => {
  const user = await User.findOne({ uid: req.uid });
  if (!user) return res.status(404).send("User not found");

  res.json({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    dob: user.dob,
    insta: user.insta || "",
    website: user.website || "",
    youtube: user.youtube || "",
    avatar: user.avatar || "",
  });
});
// Example Express route
router.put("/profile/update", verifySession, async (req, res) => {
  const { insta, website, youtube ,avatar } = req.body;
  const userId = req.user.id; // Assuming you're using middleware to extract `user`

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { insta, website, youtube, avatar },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// router.post("/avatar", verifySession, async (req, res) => {
//   const { avatar } = req.body;
//   try {
//     const user = await User.findOneAndUpdate(
//       { uid: req.uid },
//       { avatar },
//       { new: true }
//     );
//     res.json({ message: "Avatar updated", user });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update avatar" });
//   }
// });

module.exports = router;
