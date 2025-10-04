const express = require("express");
const router = express.Router();
const CoalitionSignup = require("../models/coalitionSignup");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, zip } = req.body;
    if (!name || !email || !phone || !zip) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const trimmed = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      zip: String(zip).trim(),
    };

    if (!trimmed.name || !trimmed.email || !trimmed.phone || !trimmed.zip) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const signup = await CoalitionSignup.create(trimmed);
    res.status(201).json({ id: signup.id });
  } catch (err) {
    console.error("Coalition signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
