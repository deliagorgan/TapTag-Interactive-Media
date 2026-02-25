'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommentReportNotification extends Model {
    static associate(models) {
      CommentReportNotification.belongsTo(models.CommentReport, {
        foreignKey: 'commentReportID',
        as: 'commentReport',
      });
      CommentReportNotification.belongsTo(models.User, {
        foreignKey: 'recipientID',
        as: 'recipient',
      });
    }
  }
  CommentReportNotification.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    commentReportID: {
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
    modelName: 'CommentReportNotification',
    tableName: 'commentReportNotifications',
    updatedAt: false
  });
  return CommentReportNotification;
};
