const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    avatarUrl: { type: DataTypes.STRING },
    primaryName: { type: DataTypes.STRING },
    primaryPhone: { type: DataTypes.STRING },
    primaryEmail: { type: DataTypes.STRING },
    primaryEmployment: { type: DataTypes.STRING },
    primaryWorkPhone: { type: DataTypes.STRING },
    primaryOccupation: { type: DataTypes.STRING },
    previousExperience: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    stateZip: { type: DataTypes.STRING },
    rentOrOwn: { type: DataTypes.STRING },
    landlordName: { type: DataTypes.STRING },
    landlordPhone: { type: DataTypes.STRING },
    othersResiding: { type: DataTypes.STRING },
    residingDetails: { type: DataTypes.STRING },
    childrenLiving: { type: DataTypes.STRING },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

module.exports = User;