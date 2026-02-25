'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommentNotification extends Model {
    static associate(models) {
      // If the Comment is deleted, its notifications go away
      CommentNotification.belongsTo(models.Comment, {
        foreignKey: 'commentID',
        as: 'comment',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      // The user who should receive the notification (post author)
      CommentNotification.belongsTo(models.User, {
        foreignKey: 'recipientID',
        as: 'recipient',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  CommentNotification.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    commentID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'comments',
        key: 'id'
      }
    },
    recipientID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
    modelName: 'CommentNotification',
    tableName: 'commentNotifications',
    updatedAt: false
  });

  return CommentNotification;
};
