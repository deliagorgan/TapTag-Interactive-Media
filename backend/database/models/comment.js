'use strict';
const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // Define associations here if needed
      Comment.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'author',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Comment.belongsTo(models.Post, {
        foreignKey: 'postID',
        as: 'associatedPost',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Comment.hasMany(models.CommentNotification, {
        foreignKey: 'commentID',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Comment.hasMany(models.CommentReport, {
        foreignKey: 'commentID',
        as: 'reports',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Comment.init({
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
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: false
  });

  return Comment;
};
