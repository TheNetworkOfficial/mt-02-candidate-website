// routes/healthInspections.js

const express = require("express");
const router = express.Router();
const HealthInspection = require("../models/healthInspection");
const Reptile = require("../models/reptile");

// ——————————————————————————————
// GET /api/health-inspections/:reptileId
// ——————————————————————————————
router.get("/:reptileId", async (req, res) => {
  try {
    const inspections = await HealthInspection.findAll({
      where: { reptile_id: req.params.reptileId },
      order: [["date", "DESC"]],
    });
    res.json(inspections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ——————————————————————————————
// POST /api/health-inspections
// (REPLACE your old handler with this one)
// ——————————————————————————————
router.post("/", async (req, res) => {
  try {
    // pull every field out of the request body
    const {
      reptile_id,
      date,               // optional: model has defaultValue
      hold72,
      weight,
      posture,
      postureExplain,
      hydration,
      energy,
      vent,
      eyes,
      nostrils,
      toes,
      nails,
      tail,
      blemish,
      blemishExplain,
      kinks,
      kinksExplain,
      shed,
      shedExplain,
      parasites,
      parasitesExplain,
      notes,
    } = req.body;

    // create with all required columns
    const newInspection = await HealthInspection.create({
      reptile_id,
      date,              // or omit if you’d rather use the default
      hold72,
      weight,
      posture,
      postureExplain,
      hydration,
      energy,
      vent,
      eyes,
      nostrils,
      toes,
      nails,
      tail,
      blemish,
      blemishExplain,
      kinks,
      kinksExplain,
      shed,
      shedExplain,
      parasites,
      parasitesExplain,
      notes,
    });

    res.status(201).json(newInspection);
  } catch (err) {
    console.error("Create failed:", err);
    res.status(400).json({ error: err.message });
  }
});

// ——————————————————————————————
// DELETE /api/health-inspections/:id
// ——————————————————————————————
router.delete("/:id", async (req, res) => {
  try {
    const count = await HealthInspection.destroy({
      where: { id: req.params.id },
    });
    if (!count) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ——————————————————————————————
// GET /api/health-inspections/:id/pdf
// ——————————————————————————————
router.get("/:id/pdf", async (req, res) => {
  // fetch the inspection record
  const ins = await HealthInspection.findByPk(req.params.id);
  if (!ins) return res.status(404).send("Not found");

  // fetch the reptile so we can get its name
  const reptile = await Reptile.findByPk(ins.reptile_id);

  let PDFDocument;
  try {
    PDFDocument = require("pdfkit");
  } catch (err) {
    console.error("PDFKit not installed:", err);
    return res.status(500).send("PDF generation is unavailable");
  }

  // start the PDF
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // Title
  doc.fontSize(16)
     .text("Health Inspection Report", { align: "center" })
     .moveDown();

  // 2) Reptile name + ID
  doc.fontSize(12)
     .text(`Reptile: ${reptile ? reptile.name : "Unknown"} (ID: ${ins.reptile_id})`)
     .moveDown();

  // 3) All other inspection fields
  Object.entries(ins.dataValues)
    .filter(([k]) => k !== "id" && k !== "reptile_id")
    .forEach(([k, v]) => {
      doc.fontSize(12).text(`${k}: ${v}`);
    });

  doc.end();
});

module.exports = router;
