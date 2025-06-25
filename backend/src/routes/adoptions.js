const express = require('express');
const router = express.Router();
const Adoption = require('../models/adoption');
const Paperwork = require('../models/paperwork'); // Mongoose model

router.post('/', async (req, res) => {
  try {
    const { userId, reptileId, files } = req.body;
    // 1) Save paperwork in MongoDB
    const newPaperwork = await Paperwork.create({ userId, reptileId, files });
    // 2) Create PostgreSQL adoption record with reference to Mongo _id
    const adoptionEntry = await Adoption.create({
      user_id: userId,
      reptile_id: reptileId,
      paperwork_id: newPaperwork._id.toString() // store as text
    });
    res.status(201).json(adoptionEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;