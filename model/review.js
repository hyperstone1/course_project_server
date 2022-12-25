const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Review = sequelize.define('review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idUser: { type: DataTypes.INTEGER },
  type: { type: DataTypes.STRING },
  header: { type: DataTypes.STRING },
  coverURL: { type: DataTypes.STRING },
  tags: { type: DataTypes.STRING },
});
module.exports = Review;
