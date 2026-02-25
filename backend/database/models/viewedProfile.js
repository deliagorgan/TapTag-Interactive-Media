'use strict';
const { Sequelize, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ViewedProfile extends Model {
    static associate(models) {
      // Define associations here if needed
      ViewedProfile.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'viewer',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      ViewedProfile.belongsTo(models.User, {
        foreignKey: 'profileID',
        as: 'viewedProfile',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  ViewedProfile.init({
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
    profileID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'ViewedProfile',
    tableName: 'viewedProfiles',
    timestamps: false
  });

  return ViewedProfile;
};
