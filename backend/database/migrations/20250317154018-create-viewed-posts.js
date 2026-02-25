'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ViewedPosts', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Name of the table, NOT the model
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      postID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Posts', // Name of the table, NOT the model
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      viewedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ViewedPosts');
  }
};
