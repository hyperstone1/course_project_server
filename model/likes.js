const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Likes = sequelize.define('likes', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idUser: { type: DataTypes.INTEGER },
  idReview: { type: DataTypes.STRING },
});
module.exports = Likes;
