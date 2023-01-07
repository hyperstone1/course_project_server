const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Review = sequelize.define('reviews', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idUser: { type: DataTypes.INTEGER },
  userName: {type: DataTypes.STRING},
  type: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING },
  coverURL: { type: DataTypes.STRING },
  imagesURL: { type: DataTypes.ARRAY(DataTypes.STRING) },
  text: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  headers: { type: DataTypes.ARRAY(DataTypes.STRING) },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING) },
  likes: { type: DataTypes.INTEGER },
  rating: { type: DataTypes.INTEGER },
});
module.exports = Review;
