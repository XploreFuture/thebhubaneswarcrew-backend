require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const contentRoutes = require("./routes/content");
const videoRoute = require("./routes/video");
const ticketRoute = require("./routes/ticketRoutes");
const Event = require('./models/Event');


const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/videos", videoRoute);
app.use("/api/reviews", require("./routes/review"));
app.use("/api/events", require("./routes/event"));
app.use("/api/tickets", ticketRoute)
app.use("/api/participants", require("./routes/participantRoutes"));

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// setInterval(async () => {
//   const now = new Date();
//   try {
//     const result = await Event.deleteMany({ date: { $lt: now } });
//     console.log(`Deleted ${result.deletedCount} expired events`);
//   } catch (err) {
//     console.error("Error deleting expired events:", err);
//   }
// }, 60 * 60 * 1000);

startServer();

