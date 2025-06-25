const express = require("express");
const router = express.Router();
const AdoptionApp = require("../models/adoptionApp");
const Reptile = require("../models/reptile");
const User = require("../models/user");

function broadcastPaymentPending(reptile, user) {
  console.log(`Payment pending for reptile ${reptile.id} and user ${user.id}`);
}

function ensureAuth(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// Submit a new adoption application
router.post("/", ensureAuth, async (req, res) => {
  try {
    const { reptileId, ...rest } = req.body;
    const record = await AdoptionApp.create({
      ...rest,
      reptile_id: reptileId,
      user_id: req.session.userId,
    });

    // Update user fields if values differ
    const user = await User.findByPk(req.session.userId);
    if (user) {
      const fields = [
        "primaryName",
        "primaryPhone",
        "primaryEmail",
        "primaryEmployment",
        "primaryWorkPhone",
        "primaryOccupation",
        "previousExperience",
        "address",
        "city",
        "stateZip",
        "rentOrOwn",
        "landlordName",
        "landlordPhone",
        "othersResiding",
        "residingDetails",
        "childrenLiving",
      ];

      const updates = {};
      for (const f of fields) {
        if (rest[f] !== undefined && rest[f] !== user[f]) updates[f] = rest[f];
      }
      if (Object.keys(updates).length) await user.update(updates);
    }
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List applications for the current user
router.get("/my", ensureAuth, async (req, res) => {
  try {
    const apps = await AdoptionApp.findAll({
      where: { user_id: req.session.userId },
      order: [["createdAt", "DESC"]],
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all pending applications
router.get("/pending", async (req, res) => {
  try {
    const apps = await AdoptionApp.findAll({
      where: { status: "pending" },
      order: [["createdAt", "DESC"]],
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/pending-payment", async (req, res) => {
  try {
    const reptiles = await Reptile.findAll({
      where: { status: "pendingPayment" },
    });
    const results = [];
    for (const reptile of reptiles) {
      const app = await AdoptionApp.findOne({
        where: { reptile_id: reptile.id, status: "approved" },
        order: [["createdAt", "DESC"]],
      });
      let user = null;
      if (app) user = await User.findByPk(app.user_id);
      results.push({ reptile, user });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application status
router.put("/:id/status", async (req, res) => {
  try {
    const app = await AdoptionApp.findByPk(req.params.id);
    if (!app) return res.status(404).json({ error: "Application not found" });
    const { status, reptileId } = req.body;
    if (!["approved", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await app.update({ status, reptile_id: reptileId || app.reptile_id });

    const targetId = reptileId || app.reptile_id;
    if (status === "approved" && targetId) {
      const reptile = await Reptile.findByPk(targetId);
      if (reptile) {
        await reptile.update({ status: "pendingPayment" });
        const user = await User.findByPk(app.user_id);
        if (user) broadcastPaymentPending(reptile, user);
      }
    }

    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;