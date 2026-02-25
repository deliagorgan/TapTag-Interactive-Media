const { ViewedProfile, User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(viewedProfileOperations.js): ";

/*
    functie care adauga ca un profil a fost vizionat de un utilizator
*/
async function addViewedProfile(view) {
    try {
        const {userID, profileID} = view;

        /*
            se creaza noua legatura
        */
        const newView = await ViewedProfile.create({
            userID: userID,
            profileID: profileID
        });

        return newView;
    } catch (err) {
        logError(prefix, `Error adding viewer to profile: ${err}`);
        return null;
    }
}

/*
    functie care returneaza vizualizarile unui utilizator
    pentru un anumita profil
*/
async function getViewsByProfileIDUserID(userID, profileID) {
    try {

        const result = await ViewedProfile.findAll({
            where: { userID: userID,
                profileID: profileID }
        });

        if (result.length <= 0)
            return null;

        return result;

    } catch (err) {
        logError(prefix, `Error while searching for the number of views for a certain user and profile: ${err}`);
        return null;
    }
}


/*
    functie care returneaza numarul de vizualizari ale unui utilizator
    pentru orice profil
*/
async function getTotalNumberOfViewedProfiles(userID) {
    try {

        const result = await ViewedProfile.findAll({
            where: { userID },
        });

        return result.length;

    } catch (err) {
        logError(prefix, `Error while searching for the total number of views: ${err}`);
        return null;
    }
}

/*
    functie care returneaza vizualizarile pentru un anumit profil
*/
async function getViewsByProfileID(profileID) {
    try {
        logSuccess(prefix, profileID);

        const result = await ViewedProfile.findAll({
            where: { profileID },
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
    addViewedProfile,
    getTotalNumberOfViewedProfiles,
    getViewsByProfileIDUserID,
    getViewsByProfileID
};
