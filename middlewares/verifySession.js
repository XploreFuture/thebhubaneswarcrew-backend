const admin = require("../firebase/firebaseAdmin");
const User = require("../models/User");

const verifySession = async (req, res, next) => {
  const sessionCookie = req.cookies.session;

  if (!sessionCookie) {
    return res.status(401).json({ message: "Unauthorized: No session cookie" });
  }

  try {
    // ✅ Verify Firebase session cookie
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.uid = decoded.uid;

    // ✅ Fetch user from MongoDB
    let user = await User.findOne({ uid: decoded.uid });

    // If user not found, create a basic one with role "user"
    if (!user) {
      const firebaseUser = await admin.auth().getUser(decoded.uid);
      user = await User.create({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: firebaseUser.displayName || '',
        dob: new Date(), // Optional
        role: "user", // 👈 DEFAULT is just "user"
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("verifySession error:", err);
    return res.status(401).json({ message: "Unauthorized: Invalid session" });
  }
};

module.exports = verifySession;
