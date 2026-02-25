const sequelize = require('../db.js');
const { Like, Post, User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(likeOperations.js): ";

/*
    functie care adauga un like
*/
async function addLike(like) {
    try {
        const result = await Like.create({
            userID: like.userID,
            postID: like.postID
        });

        if (!result)
            return null;

        logSuccess(prefix, `Like added to post ${like.postID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding like: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza un like dupa id
    returneaza si userul care a scris
*/
async function findLikeByID(id) {
    try {

        return await Like.findByPk(id);

    } catch (err) {
        logError(prefix, `Error while searching for like ${id}: ${err}`);
        return null;
    }
}

/*
    functie care gaseste like uri dupa postID
    returneaza si userul care a dat like
*/
async function findLikesByPostID(postID) {
    try {

        return await Like.findAll({
            where: {postID: postID},
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'profilePhotoID', 'DOB', 'gender']
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for likes of post ${postID}: ${err}`);
        return null;
    }
}


/*
    functie care gaseste like uri dupa userID
    returneaza si postarea la care a dat like
*/
async function findLikesByUserID(userID) {
    try {

        return await Like.findAll({
            where: {userID: userID},
            include: [
                {
                    model: Post,
                    as: 'likedPost'
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for likes of post ${postID}: ${err}`);
        return null;
    }
}


/*
    functie care gaseste like uri dupa userID si postID
*/
async function findLikesByUserAndPostID(userID, postID) {
    try {

        return await Like.findOne({
            where: {userID: userID,
                    postID: postID},
            include: [
                {
                    model: Post,
                    as: 'likedPost'
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for likes of post ${postID}: ${err}`);
        return null;
    }
}


/*
    functie care sterge un like
*/
async function deleteLike(id) {
    try {
        const result = await Like.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} like(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting like: ${err}.`);
        return false;
    }
}

module.exports = {
    findLikeByID,
    findLikesByPostID,
    findLikesByUserID,
    findLikesByUserAndPostID,
    addLike,
    deleteLike
};
