const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Image = sequelize.define('image', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idUser: { type: DataTypes.INTEGER },
  URL: { type: DataTypes.STRING, unique: true },
});
module.exports = Image;
