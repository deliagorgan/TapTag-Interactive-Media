'use strict';
const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      // Define associations here if needed
      Image.hasOne(models.Post, {
        foreignKey: 'photoID',
        as: 'post',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Image.hasOne(models.User, {
        foreignKey: 'profilePhotoID',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Image.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Image',
    tableName: 'images',
    timestamps: false
  });

  return Image;
};
