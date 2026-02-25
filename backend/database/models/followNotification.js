'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FollowNotification extends Model {
    static associate(models) {
      FollowNotification.belongsTo(models.Follower, {
        foreignKey: 'followID',
        as: 'follow',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      // Who receives the notification (the user being followed)
      FollowNotification.belongsTo(models.User, {
        foreignKey: 'recipientID',
        as: 'recipient',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  FollowNotification.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    followID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'followers',
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
    modelName: 'FollowNotification',
    tableName: 'followNotifications',
    updatedAt: false
  });

  return FollowNotification;
};
