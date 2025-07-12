const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const { ensureAdmin } = require("../middleware/auth");

router.get("/", async (_req, res) => {
  try {
    const events = await Event.findAll({ order: [["eventDate", "ASC"]] });
    res.json(events);
  } catch (err) {
    console.error("Fetch events error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", ensureAdmin, async (req, res) => {
  try {
    const { title, description, eventDate, location } = req.body;
    if (!title || !eventDate) {
      return res.status(400).json({ error: "Title and date required" });
    }
    const event = await Event.create({
      title,
      description,
      eventDate,
      location,
    });
    res.status(201).json(event);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Fetch event error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;