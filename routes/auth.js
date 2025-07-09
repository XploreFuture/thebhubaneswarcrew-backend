const express = require("express");
const router = express.Router();
const admin = require("../firebase/firebaseAdmin");
const User = require('../models/User');
const verifySession = require("../middlewares/verifySession");

router.post("/setSessionCookie", async (req, res) => {
  const { token } = req.body;

  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await admin.auth().createSessionCookie(token, { expiresIn });

    const options = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    };

    res.cookie("session", sessionCookie, options);
    res.status(200).send("Session cookie set");
  } catch (err) {
    console.error("Error setting session cookie:", err);
    res.status(401).send("Unauthorized");
  }
});

router.get("/me", verifySession, (req, res) => {
  // req.user is set by verifySession middleware
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  res.status(200).json({
    uid: user.uid,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    dob: user.dob
    // <-- This is crucial
  });
});



router.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.status(200).send("Logged out");
});
router.post("/sessionLogin", async (req, res) => {
  const { idToken, fullName, whatsapp, dob } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token required" });
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Create session cookie (valid for 5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // Set session cookie
    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    // Save user to MongoDB if not already present
    const existingUser = await User.findOne({ uid });
    if (!existingUser) {
      await User.create({
        uid,
        fullName,
        email,
        whatsapp: whatsapp || null,
        dob: dob ? new Date(dob) : null,
      });
    }

    return res.status(200).json({ message: "Session created and user saved" });
  } catch (error) {
    console.error("Session login error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
});
// GET all content
router.get("/all", async (req, res) => {
  try {
    const contents = await Content.find();
    res.status(200).json(contents);
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


module.exports = router;
