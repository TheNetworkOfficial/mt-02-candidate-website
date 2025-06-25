// models/reptile.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Reptile extends Model {}

Reptile.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    species: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    location: { type: DataTypes.STRING },
    sex: { type: DataTypes.STRING },
    traits: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    requirements: { type: DataTypes.TEXT },

    // Make sure this field is JSON (not STRING or ARRAY).
    image_urls: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [], // Sequelize will create DEFAULT '[]'::json
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "adoptable",
      validate: {
        isIn: [["adoptable", "pendingPayment", "owned", "for sale", "deceased"]],
      },
    },

    owner_id: { type: DataTypes.INTEGER },
  },
  {
    sequelize,
    modelName: "Reptile",
    tableName: "reptiles",
  },
);

module.exports = Reptile;