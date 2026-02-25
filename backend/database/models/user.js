'use strict';
const { Model, Sequelize} = require('sequelize');
const jwt = require('jsonwebtoken');
const {UserRoles} = require('../../server/constants/userRole.js');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here if needed
      User.belongsTo(models.Image, {
        foreignKey: 'profilePhotoID',
        as: 'profileImage',
        onDelete: 'SET NULL', // se pastreaza userul daca poza de profil este stearsa
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.Post, {
        foreignKey: 'userID',
        as: 'posts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.Comment, {
        foreignKey: 'userID',
        as: 'comments',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.Like, {
        foreignKey: 'userID',
        as: 'likedPosts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });


      User.hasMany(models.CommentNotification, {
        foreignKey: 'recipientID',
        as: 'receivedCommentNotifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.LikeNotification, {
        foreignKey: 'recipientID',
        as: 'receivedLikeNotifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.FollowNotification, {
        foreignKey: 'recipientID',
        as: 'receivedFollowNotifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.PostNotification, {
        foreignKey: 'recipientID',
        as: 'receivedPostNotifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.GenericNotification, {
        foreignKey: 'recipientID',
        as: 'genericNotifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.CommentReportNotification, {
        foreignKey: 'recipientID',
        as: 'commentReportNotifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.hasMany(models.PostReportNotification, {
        foreignKey: 'recipientID',
        as: 'postReportNotifications',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });


      // reports this user created
      User.hasMany(models.CommentReport, {
        foreignKey: 'reporterID',
        as: 'reportsMade',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });


      // rapoarte trimise de acest user
      User.hasMany(models.PostReport, {
        foreignKey: 'reporterID',
        as: 'postReportsMade',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });



      User.belongsToMany(models.User, {
        as: 'followers',
        through: models.Follower,
        foreignKey: 'followedUserID',  // Cheia pentru utilizatorul curent (cel urmarit)
        otherKey: 'userID',             // Cheia pentru utilizatorii care mă urmăresc
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      User.belongsToMany(models.User, {
        as: 'following',
        through: models.Follower,
        foreignKey: 'userID',          // Cheia pentru utilizatorul curent (cel care urmareste)
        otherKey: 'followedUserID',     // Cheia pentru utilizatorii pe care îi urmăresc
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });


      User.belongsToMany(models.Post, {
        as: 'viewedPosts',
        through: models.ViewedPost,
        foreignKey: 'userID',  // User who viewed the post
        otherKey: 'postID',    // The post that was viewed
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      User.belongsToMany(models.Post, {
        as: 'viewedRegions',
        through: models.ViewedRegion,
        foreignKey: 'userID',  // User who viewed the post
        otherKey: 'postID',    // The post that was viewed
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });


      User.hasMany(models.ViewedProfile, {
        foreignKey: 'userID',
        as: 'viewedProfiles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      // My profile has been viewed by many users
      User.hasMany(models.ViewedProfile, {
        foreignKey: 'profileID',
        as: 'profileViewers',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  User.prototype.generateAuthToken = function() {
    return jwt.sign(
        { id: this.id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
  };

  User.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePhotoID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "OTHER"
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[UserRoles.ADMIN, UserRoles.BUSINESS, UserRoles.NORMAL, UserRoles.PREMIUM]]
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DOB: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });

  return User;
};
