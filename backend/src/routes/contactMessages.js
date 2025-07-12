const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/contactMessage");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const entry = await ContactMessage.create({ name, email, message });
    res.status(201).json(entry);
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;