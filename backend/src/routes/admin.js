const express = require("express");
const router = express.Router();
const { ensureAdmin } = require("../middleware/auth");
const ContactMessage = require("../models/contactMessage");
const Volunteer = require("../models/volunteer");
const EventSignup = require("../models/eventSignup");
const MailingListSignup = require("../models/mailingListSignup");

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

router.patch("/contact-messages/:id/read", async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    msg.read = true;
    await msg.save();
    res.json({ message: "marked read" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/contact-messages/:id", async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    await msg.destroy();
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("Delete message error:", err);
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

router.get("/mailing-list", async (_req, res) => {
  try {
    const list = await MailingListSignup.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(list);
  } catch (err) {
    console.error("Fetch mailing list error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
