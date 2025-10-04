const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CoalitionSignup = sequelize.define(
  "CoalitionSignup",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    zip: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "coalition_signups",
    timestamps: true,
  },
);

module.exports = CoalitionSignup;
