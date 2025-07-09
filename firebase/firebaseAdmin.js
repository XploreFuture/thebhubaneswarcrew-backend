// backend/firebase/firebaseAdmin.js

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Check if already initialized
if (!admin.apps || !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
