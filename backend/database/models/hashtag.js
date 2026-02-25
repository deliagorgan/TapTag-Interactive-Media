'use strict';
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Hashtag extends Model {
    static associate(models) {
      // Define associations here if needed
      Hashtag.belongsToMany(models.Post, {
        through: 'PostHashtag',
        foreignKey: 'hashtagID',
        otherKey: 'postID',
        as: 'posts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Hashtag.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Hashtag',
    tableName: 'hashtags',
    timestamps: false
  });

  return Hashtag;
};
