'use strict';
const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Follower extends Model {
    static associate(models) {
      // Define associations here if needed
      Follower.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'followerUser',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Follower.belongsTo(models.User, {
        foreignKey: 'followedUserID',
        as: 'followedUser',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Follower.hasMany(models.FollowNotification, {
        foreignKey: 'followID',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Follower.init({
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
    followedUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
    },
    followedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'Follower',
    tableName: 'followers',
    timestamps: false
  });

  return Follower;
};
