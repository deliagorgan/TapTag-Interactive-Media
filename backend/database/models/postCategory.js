'use strict';
const { Sequelize, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostCategory extends Model {
    static associate(models) {
      // Define associations here if needed
      PostCategory.belongsTo(models.Post, {
        foreignKey: 'postID',
        as: 'post',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  PostCategory.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    postID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
      }
  }, {
    sequelize,
    modelName: 'PostCategory',
    tableName: 'postCategory',
    timestamps: false
  });

  return PostCategory;
};
