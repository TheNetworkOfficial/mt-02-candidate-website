// models/healthInspection.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class HealthInspection extends Model {}

HealthInspection.init(
  {
    reptile_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    // → all your new fields from the form:
    hold72: {
      type: DataTypes.STRING,   // "yes" / "no"
      allowNull: false,
    },
    weight: {
      type: DataTypes.STRING,   // "good" / "overweight" / "underweight"
      allowNull: false,
    },
    posture: {
      type: DataTypes.STRING,   // "good" / "poor"
      allowNull: false,
    },
    postureExplain: {
      type: DataTypes.TEXT,
    },
    hydration: {
      type: DataTypes.STRING,   // "good" / "dehydrated"
      allowNull: false,
    },
    energy: {
      type: DataTypes.STRING,   // "alert" / "lethargic"
      allowNull: false,
    },
    vent: {
      type: DataTypes.STRING,   // "clear" / "infected"
      allowNull: false,
    },
    eyes: {
      type: DataTypes.STRING,   // "clear" / "infected"
      allowNull: false,
    },
    nostrils: {
      type: DataTypes.STRING,   // "clear" / "blocked" / "infected"
      allowNull: false,
    },
    toes: {
      type: DataTypes.STRING,   // "all-clear" / "missing" / "stuck-shed"
      allowNull: false,
    },
    nails: {
      type: DataTypes.STRING,   // "good" / "trim"
      allowNull: false,
    },
    tail: {
      type: DataTypes.STRING,   // "original" / "partial" / "regenerated"
      allowNull: false,
    },
    blemish: {
      type: DataTypes.STRING,   // "yes" / "no"
      allowNull: false,
    },
    blemishExplain: {
      type: DataTypes.TEXT,
    },
    kinks: {
      type: DataTypes.STRING,   // "yes" / "no"
      allowNull: false,
    },
    kinksExplain: {
      type: DataTypes.TEXT,
    },
    shed: {
      type: DataTypes.STRING,   // "yes" / "no"
      allowNull: false,
    },
    shedExplain: {
      type: DataTypes.TEXT,
    },
    parasites: {
      type: DataTypes.STRING,   // "yes" / "no"
      allowNull: false,
    },
    parasitesExplain: {
      type: DataTypes.TEXT,
    },

    // final notes / treatment
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "HealthInspection",
    tableName: "health_inspections",
    timestamps: false,
  }
);

module.exports = HealthInspection;