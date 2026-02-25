'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('post_hashtags', {
      postID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        primaryKey: true
      },
      hashtagID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'hashtags',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        primaryKey: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('post_hashtags');
  }
};
