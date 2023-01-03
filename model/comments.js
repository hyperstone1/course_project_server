const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const Comments = sequelize.define('comments', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idUser: { type: DataTypes.INTEGER },
  comment: { type: DataTypes.STRING },
});
module.exports = Comments;
