'use strict';
/** @type {import('sequelize-cli').Migration} */
const { UserRoles } = require('../../server/constants/userRole.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      token: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      profilePhotoID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'images',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "OTHER"
      },
      role: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[UserRoles.ADMIN, UserRoles.BUSINESS, UserRoles.NORMAL, UserRoles.PREMIUM]]
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      DOB: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};