'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      // Define associations here if needed
      Like.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'author',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Like.belongsTo(models.Post, {
        foreignKey: 'postID',
        as: 'likedPost',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Like.hasMany(models.LikeNotification, {
        foreignKey: 'likeID',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Like.init({
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: false
  });

  return Like;
};
