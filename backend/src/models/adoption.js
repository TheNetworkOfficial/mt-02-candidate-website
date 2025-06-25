const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Reptile = require('./reptile');

const Adoption = sequelize.define(
  'Adoption',
  {
    paperwork_id: {
      type: DataTypes.TEXT,  // Stores MongoDB ObjectId as string
      allowNull: true
    }
  },
  {
    tableName: 'adoptions',
    timestamps: false
  }
);

// Associations
User.hasMany(Adoption, { foreignKey: 'user_id' });
Reptile.hasMany(Adoption, { foreignKey: 'reptile_id' });
Adoption.belongsTo(User, { foreignKey: 'user_id' });
Adoption.belongsTo(Reptile, { foreignKey: 'reptile_id' });

module.exports = Adoption;