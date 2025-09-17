const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CoalitionCandidate = sequelize.define(
  "CoalitionCandidate",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jurisdictionLevel: {
      type: DataTypes.ENUM("federal", "state", "county", "city"),
      allowNull: false,
    },
    office: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    websiteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialLinks: {
      // Stored as an array of { label, url }
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    headshotImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "accepted",
    },
    submittedByName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    submittedByEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    submittedByPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    submittedByZip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "coalition_candidates",
    timestamps: true,
    indexes: [
      {
        fields: ["jurisdictionLevel", "sortOrder"],
      },
      {
        fields: ["status"],
      },
    ],
  },
);

module.exports = CoalitionCandidate;
