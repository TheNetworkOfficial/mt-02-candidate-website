const express = require("express");
const router = express.Router();
const { ensureAdmin } = require("../middleware/auth");
const ContactMessage = require("../models/contactMessage");
const Volunteer = require("../models/volunteer");
const EventSignup = require("../models/eventSignup");

router.use(ensureAdmin);

router.get("/contact-messages", async (_req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(messages);
  } catch (err) {
    console.error("Fetch contact messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/volunteers", async (_req, res) => {
  try {
    const volunteers = await Volunteer.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(volunteers);
  } catch (err) {
    console.error("Fetch volunteers error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/event-signups", async (_req, res) => {
  try {
    const signups = await EventSignup.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(signups);
  } catch (err) {
    console.error("Fetch event signups error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;