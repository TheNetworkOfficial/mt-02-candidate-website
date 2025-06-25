// routes/surrenders.js
const express = require('express');
const router  = express.Router();
const Surrender = require('../models/surrender');

// POST /api/surrenders
router.post('/', async (req, res) => {
  try {
    // req.body will hold all your form fields
    const record = await Surrender.create({
      ...req.body,
      // convert “Yes”/“No” to boolean
      haveVet: req.body.haveVet === 'Yes',
    });
    return res.status(201).json(record);
  } catch (err) {
    console.error('Error creating surrender:', err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;