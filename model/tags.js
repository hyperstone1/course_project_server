const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Tags = sequelize.define('tags', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tag: { type: DataTypes.STRING, unique: true },
});
module.exports = Tags;
