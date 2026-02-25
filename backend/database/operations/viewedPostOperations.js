const { ViewedPost, User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(viewedPostOperations.js): ";

/*
    functie care adauga ca o postare a fost vizionata de un utilizator
*/
async function addViewedPost(view) {
    try {
        const {userID, postID} = view;

        /*
            se creaza noua legatura
        */
        const newView = await ViewedPost.create({
            userID: userID,
            postID: postID
        });

        return newView;
    } catch (err) {
        logError(prefix, `Error adding viewer to post: ${err}`);
        return null;
    }
}

/*
    functie care returneaza vizualizarile unui utilizator
    pentru o anumita postare
*/
async function getViewsByPostIDUserID(userID, postID) {
    try {

        const result = await ViewedPost.findAll({
            where: { userID: userID,
                     postID: postID }
        });

        if (result.length <= 0)
            return null;

        return result;

    } catch (err) {
        logError(prefix, `Error while searching for the number of views for a certain user and post: ${err}`);
        return null;
    }
}


/*
    functie care returneaza numarul de vizualizari ale unui utilizator
    pentru orice postare
*/
async function getTotalNumberOfViewedPosts(userID) {
    try {

        const result = await ViewedPost.findAll({
            where: { userID },
        });

        return result.length;

    } catch (err) {
        logError(prefix, `Error while searching for the total number of views: ${err}`);
        return null;
    }
}

/*
    functie care returneaza vizualizarile pentru o
    anumita postare
*/
async function getViewsByPostID(postID) {
    try {
        logSuccess(prefix, postID);
        const result = await ViewedPost.findAll({
            where: { postID },
            include: [{
                model: User,
                as: 'viewer',
                attributes: [
                  'id',
                  'username',
                  'gender',
                  'DOB'
                ]
              }]
        });

        logSuccess(prefix, result);

        return result;

    } catch (err) {
        logError(prefix, `Error while searching for the total number of views: ${err}`);
        return null;
    }
}


module.exports = {
    addViewedPost,
    getTotalNumberOfViewedPosts,
    getViewsByPostIDUserID,
    getViewsByPostID
};
