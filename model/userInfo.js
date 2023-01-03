const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const userInfo = sequelize.define('userInfo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idUser: { type: DataTypes.INTEGER },
  name: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  secondName: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
});
module.exports = userInfo;
