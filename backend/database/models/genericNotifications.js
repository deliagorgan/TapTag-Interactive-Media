'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GenericNotification extends Model {
    static associate(models) {
      // who should receive this notification
      GenericNotification.belongsTo(models.User, {
        foreignKey: 'recipientID',
        as: 'recipient',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  GenericNotification.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    recipientID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
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
    modelName: 'GenericNotification',
    tableName: 'genericNotifications',
    updatedAt: false
  });
  return GenericNotification;
};
