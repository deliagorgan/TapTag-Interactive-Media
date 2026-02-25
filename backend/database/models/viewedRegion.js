'use strict';
const { Sequelize, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ViewedRegion extends Model {
    static associate(models) {
      // Define associations here if needed
      ViewedRegion.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'viewer',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      ViewedRegion.belongsTo(models.Post, {
        foreignKey: 'postID',
        as: 'viewedRegion',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  ViewedRegion.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'ViewedRegion',
    tableName: 'viewedRegions',
    timestamps: false
  });

  return ViewedRegion;
};
