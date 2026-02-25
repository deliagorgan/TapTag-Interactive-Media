const { ViewedRegion, User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(viewedRegionOperations.js): ";

/*
    functie care adauga ca o regiune a fost vizionata de un utilizator
*/
async function addViewedRegion(view) {
    try {
        const {userID, type, postID} = view;

        /*
            se creaza noua vizionare
        */
        const newView = await ViewedRegion.create({
            userID,
            postID,
            type
        });

        return newView;
    } catch (err) {
        logError(prefix, `Error adding viewer to region: ${err}`);
        return null;
    }
}

/*
    functie care returneaza vizualizarile regiunilor unei postari
    de catre un utilizator
*/
async function getRegionViewsByPostIDUserID(userID, postID) {
    try {

        const result = await ViewedRegion.findAll({
            where: { userID: userID,
                postID: postID }
        });

        if (result.length <= 0)
            return null;

        return result;

    } catch (err) {
        logError(prefix, `Error while searching for the number of region views for a certain user and post: ${err}`);
        return null;
    }
}


/*
    functie care returneaza numarul de vizualizari pt regiuni ale unui utilizator
*/
async function getTotalNumberOfViewedRegions(userID) {
    try {

        const result = await ViewedRegion.findAll({
            where: { userID },
        });

        return result.length;

    } catch (err) {
        logError(prefix, `Error while searching for the total number of region views: ${err}`);
        return null;
    }
}

/*
    functie care returneaza vizualizarile regiunilor pentru o anumita postare
*/
async function getRegionViewsByPostID(postID) {
    try {

        const result = await ViewedRegion.findAll({
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
        logError(prefix, `Error while searching for the total number of region views for a certain post: ${err}`);
        return null;
    }
}


module.exports = {
    addViewedRegion,
    getTotalNumberOfViewedRegions,
    getRegionViewsByPostIDUserID,
    getRegionViewsByPostID
};
