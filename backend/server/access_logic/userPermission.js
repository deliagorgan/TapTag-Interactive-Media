const {findUserByID} = require('../../database/operations/userOperations.js');

const {logError, logSuccess} = require('../utils');
const { UserRoles } = require('../constants/userRole.js');

const prefix = "LOG(userPermission.js): ";

/*
    functia verifica daca utilizatorul poate sa primeasca toate
    informatiile despre toti userii din sistem
*/
async function canAccessAllData(userID) {
    try {
        const currentUser = await findUserByID(userID);
    
        /*
            se verifica daca utilizatorul este ADMIN => atunci are acces
        */
        if (currentUser.role == UserRoles.ADMIN)
            return true;
    
        return false
    } catch (err) {
        logError(prefix, `Error while accessing all user's data.`);
        return false;
    }
}

/*
    functia verifica daca utilizatorul poate sa primeasca informatiile
    cerute
*/
async function canAccessData(currentUserID, user) {
    try {
        /*
            se verifica daca utilizatorul exista cu acel ID
        */
        const currentUser = await findUserByID(currentUserID);

        if (!currentUser)
            return false;
    
        /*
            se verifica daca utilizatorul este ADMIN => atunci are acces
        */
        if (currentUser.role == UserRoles.ADMIN)
            return true;
    
        /*
            se verifica daca utilizatorul este detinatorul contului
        */
        if (currentUser.id == user.id)
            return true;
    
        return false
    } catch (err) {
        logError(prefix, `Error while accessing user's ${user.id} data: ${err}`);
        return false;
    }
}


/*
    functia verifica daca utilizatorul poate sa modifice informatiile
    cerute
*/
async function canUpdateData(currentUserID, user) {
    try {
        /*
            se verifica daca utilizatorul este detinatorul contului
        */
        if (currentUserID == user.id)
            return true;

        return false
    } catch (err) {
        logError(prefix, `Error while updating user's ${user.id} data`);
        return false;
    }
}


/*
    functie care extrage dintr-un JSON doar campurile care
    pot fi modificate
*/
async function extractModifiableFields(input) {
    try {
        const data = {};

        if ('username' in input)
            data.username = input.username;

        if ('lastName' in input)
            data.lastName = input.lastName;

        if ('firstName' in input)
            data.firstName = input.firstName;

        if ('profilePhotoID' in input) 
            data.profilePhotoID = input.profilePhotoID;

        if ('role' in input)
            data.role = input.role;

        if ('password' in input)
            data.password = input.password;

        if ('description' in input)
            data.description = input.description;
    
        return data;
    } catch (err) {
        logError(prefix, `Error while parsing JSON.`);
        return null;
    }
}


module.exports = {
    canAccessAllData,
    canAccessData,
    extractModifiableFields,
    canUpdateData
};