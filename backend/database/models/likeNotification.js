'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LikeNotification extends Model {
    static associate(models) {
      // if the Like is deleted, the notification goes away too
      LikeNotification.belongsTo(models.Like, {
        foreignKey: 'likeID',
        as: 'like',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      // the user who receives the notification (the post author)
      LikeNotification.belongsTo(models.User, {
        foreignKey: 'recipientID',
        as: 'recipient',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  LikeNotification.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    likeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'likes', key: 'id' }
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
    modelName: 'LikeNotification',
    tableName: 'likeNotifications',
    updatedAt: false
  });

  return LikeNotification;
};
