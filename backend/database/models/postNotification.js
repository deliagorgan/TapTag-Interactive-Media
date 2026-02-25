'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostNotification extends Model {
    static associate(models) {
      // Cascade‐delete when the post is removed
      PostNotification.belongsTo(models.Post, {
        foreignKey: 'postID',
        as: 'post',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      // Who should receive it (the follower)
      PostNotification.belongsTo(models.User, {
        foreignKey: 'recipientID',
        as: 'recipient',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  PostNotification.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    postID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'posts', key: 'id' }
    },
    recipientID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'PostNotification',
    tableName: 'postNotifications',
    updatedAt: false
  });

  return PostNotification;
};
