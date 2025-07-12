const express = require("express");
const router = express.Router();
const EventSignup = require("../models/eventSignup");

router.post("/", async (req, res) => {
  try {
    const { name, email, event_id } = req.body;
    if (!name || !email || !event_id) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const signup = await EventSignup.create({ name, email, event_id });
    res.status(201).json(signup);
  } catch (err) {
    console.error("Event signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;