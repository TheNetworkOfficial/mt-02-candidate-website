const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Event = require("./event");

const EventSignup = sequelize.define(
  "EventSignup",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    event_id: {
      type: DataTypes.INTEGER,
      references: { model: Event, key: "id" },
    },
  },
  {
    tableName: "event_signups",
    timestamps: true,
  },
);

Event.hasMany(EventSignup, { foreignKey: "event_id" });
EventSignup.belongsTo(Event, { foreignKey: "event_id" });

module.exports = EventSignup;