const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Rating = sequelize.define('rating', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idUser: { type: DataTypes.INTEGER },
  idReview: { type: DataTypes.INTEGER },
  rating: { type: DataTypes.INTEGER },
});
module.exports = Rating;
