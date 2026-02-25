'use strict';
const { Sequelize, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ViewedPost extends Model {
    static associate(models) {
      // Define associations here if needed
      ViewedPost.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'viewer',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      ViewedPost.belongsTo(models.Post, {
        foreignKey: 'postID',
        as: 'viewedPost',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  ViewedPost.init({
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
    modelName: 'ViewedPost',
    tableName: 'viewedPosts',
    timestamps: false
  });

  return ViewedPost;
};
