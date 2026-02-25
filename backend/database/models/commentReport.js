'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommentReport extends Model {
    static associate(models) {
      // which comment was reported
      CommentReport.belongsTo(models.Comment, {
        foreignKey: 'commentID',
        as: 'comment',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      // who filed the report
      CommentReport.belongsTo(models.User, {
        foreignKey: 'reporterID',
        as: 'reporter',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      CommentReport.hasMany(models.CommentReportNotification, {
        foreignKey: 'commentReportID',
        as: 'notifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  CommentReport.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    commentID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'comments', key: 'id' }
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
    modelName: 'CommentReport',
    tableName: 'commentReports',
    updatedAt: false
  });

  return CommentReport;
};
