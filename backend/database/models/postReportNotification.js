'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostReportNotification extends Model {
    static associate(models) {
      PostReportNotification.belongsTo(models.PostReport, {
        foreignKey: 'postReportID',
        as: 'postReport',
      });
      PostReportNotification.belongsTo(models.User, {
        foreignKey: 'recipientID',
        as: 'recipient',
      });
    }
  }
  PostReportNotification.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    postReportID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipientID: {
      type: DataTypes.INTEGER,
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
    modelName: 'PostReportNotification',
    tableName: 'postReportNotifications',
    updatedAt: false
  });
  return PostReportNotification;
};
