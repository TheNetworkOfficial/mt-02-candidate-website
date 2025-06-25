const express = require("express");
const router = express.Router();
const User = require("../models/user");
const AdoptionApp = require("../models/adoptionApp");
const Reptile = require("../models/reptile");

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "username",
        "email",
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
      ],
    });
    const results = [];
    for (const u of users) {
      const pending = await AdoptionApp.count({
        where: { user_id: u.id, status: "pending" },
      });
      const approved = await AdoptionApp.count({
        where: { user_id: u.id, status: "approved" },
      });
      const rejected = await AdoptionApp.count({
        where: { user_id: u.id, status: "rejected" },
      });
      const animals = await Reptile.findAll({ where: { owner_id: u.id } });
      results.push({
        id: u.id,
        username: u.username,
        email: u.email,
        primaryName: u.primaryName,
        primaryPhone: u.primaryPhone,
        primaryEmail: u.primaryEmail,
        primaryEmployment: u.primaryEmployment,
        primaryWorkPhone: u.primaryWorkPhone,
        primaryOccupation: u.primaryOccupation,
        previousExperience: u.previousExperience,
        address: u.address,
        city: u.city,
        stateZip: u.stateZip,
        rentOrOwn: u.rentOrOwn,
        landlordName: u.landlordName,
        landlordPhone: u.landlordPhone,
        othersResiding: u.othersResiding,
        residingDetails: u.residingDetails,
        childrenLiving: u.childrenLiving,
        pendingApps: pending,
        approvedApps: approved,
        rejectedApps: rejected,
        animals,
      });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;