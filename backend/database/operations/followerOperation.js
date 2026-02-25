const { Follower, User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(followerOperations.js): ";

/*
    functie care adauga un follower
*/
async function addFollower(follower) {
    try {

        const newFollower = await Follower.create({
            userID: follower.userID,
            followedUserID: follower.followedUserID
        });

        if (!newFollower)
            return null;

        logSuccess(prefix, `Follower added to ${follower.followedUserID}`);
        return newFollower;
    } catch (err) {
        logError(prefix, `Error adding follower: ${err}`);
        return null;
    }
}

/*
    functie care returneaza userii care il urmaresc pe userul userID
*/
async function findFollowersByID(userID) {
    try {

        return await Follower.findAll({
            where: {followedUserID: userID},
            include: [
                {
                    model: User,
                    as: 'followerUser', //followedUser
                    attributes: ['id', 'username', 'profilePhotoID', 'DOB', 'gender']
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for follower: ${err}`);
        return null;
    }
}


/*
    functie care returneaza userii care sunt urmariti de userul userID
*/
async function findFollowingByID(userID) {
    try {

        return await Follower.findAll({
            where: {userID: userID},
            include: [
                {
                    model: User,
                    as: 'followedUser', // followerUser
                    attributes: ['id', 'username', 'profilePhotoID', 'DOB', 'gender']
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for followers of post: ${err}`);
        return null;
    }
}

/*
    functie care verifica daca un follow exista
*/
async function followExists(userID, followedUserID) {
    try {

        const result = await Follower.findAll({
            where: {userID: userID,
                    followedUserID: followedUserID}
        });

        return result;

    } catch (err) {
        logError(prefix, `Error while searching if follow exists: ${err}`);
        return null;
    }
}

/*
    functie care sterge un follower/following
*/
async function deleteFollower(userID, followedUserID) {
    try {
        const result = await Follower.destroy({ where: { userID: userID,  followedUserID: followedUserID } });
        console.log(result);
        logSuccess(prefix, `Deleted follower.`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting follower: ${err}`);
        return false;
    }
}

module.exports = {
    findFollowersByID,
    findFollowingByID,
    followExists,
    addFollower,
    deleteFollower
};
