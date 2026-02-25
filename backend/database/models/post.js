'use strict';
const { DataTypes, Sequelize, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // Define associations here if needed
      Post.belongsTo(models.User, {
        foreignKey: 'userID',
        as: 'author',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Post.belongsTo(models.Image, {
        foreignKey: 'photoID',
        as: 'image',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Post.hasMany(models.Comment, {
        foreignKey: 'postID',
        as: 'comments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Post.hasMany(models.Like, {
        foreignKey: 'postID',
        as: 'likes',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Post.hasMany(models.PostNotification, {
        foreignKey: 'postID',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Post.hasMany(models.PostReport, {
        foreignKey: 'postID',
        as: 'reports',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      Post.hasMany(models.PostCategory, {
        as: 'categories',
        foreignKey: 'postID',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      Post.belongsToMany(models.Hashtag, {
        through: 'PostHashtag',   // tabel de legatura
        foreignKey: 'postID',
        otherKey: 'hashtagID',
        as: 'hashtags',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Post.belongsToMany(models.User, {
        as: 'postViewers',
        through: models.ViewedPost,
        foreignKey: 'postID',  // The post being viewed
        otherKey: 'userID',    // User who viewed the post
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Post.belongsToMany(models.User, {
        as: 'regionViewers',
        through: models.ViewedRegion,
        foreignKey: 'postID',
        otherKey: 'userID',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  Post.init({
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
    photoID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
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
    modelName: 'Post',
    tableName: 'posts',
    timestamps: false
  });

  return Post;
};
