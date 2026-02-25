'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostReport extends Model {
    static associate(models) {
      PostReport.belongsTo(models.Post, {
        foreignKey: 'postID',
        as: 'post',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      PostReport.belongsTo(models.User, {
        foreignKey: 'reporterID',
        as: 'reporter',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      PostReport.hasMany(models.PostReportNotification, {
        foreignKey: 'postReportID',
        as: 'notifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  PostReport.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    postID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'posts', key: 'id' }
    },
    reporterID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'PostReport',
    tableName: 'postReports',
    updatedAt: false
  });

  return PostReport;
};
