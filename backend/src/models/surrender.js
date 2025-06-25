// models/surrender.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Surrender = sequelize.define('surrender', {
  status:                 { type: DataTypes.STRING,  allowNull: false },
  typeOfAnimal:           { type: DataTypes.STRING,  allowNull: false },
  gender:                 { type: DataTypes.STRING,  allowNull: false },
  age:                    { type: DataTypes.STRING,  allowNull: false },
  animalName:             { type: DataTypes.STRING,  allowNull: false },
  eating:                 { type: DataTypes.STRING,  allowNull: false },
  feedingFrequency:       { type: DataTypes.STRING,  allowNull: false },
  substrate:              { type: DataTypes.STRING,  allowNull: false },
  ownershipDuration:      { type: DataTypes.STRING,  allowNull: false },
  lighting:               { type: DataTypes.STRING,  allowNull: false },
  haveVet:                { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  vetExplanation:        { type: DataTypes.TEXT    },
  reasonForSurrender:     { type: DataTypes.TEXT    },
  healthIssues:           { type: DataTypes.TEXT    },
  additionalNotes:        { type: DataTypes.TEXT    },
  printedName:            { type: DataTypes.STRING,  allowNull: false },
  signature:              { type: DataTypes.STRING,  allowNull: false },
  date:                   { type: DataTypes.DATEONLY,allowNull: false },
  // New column, defaults to “No” (false)
  initialHealthInspection:{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

module.exports = Surrender;