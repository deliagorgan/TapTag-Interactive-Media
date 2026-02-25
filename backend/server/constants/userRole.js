/*
    rolurile posibile pe care le poate avea un utilizator
*/

const UserRoles = Object.freeze({
    ADMIN: 1,
    BUSINESS: 2,
    NORMAL: 3,
    PREMIUM: 4
});

function fromStringToUserRoles(inputString) {

    if (inputString === 'Normal') {
        return UserRoles.NORMAL;
    } else if (inputString === 'Business') {
        return UserRoles.BUSINESS;
    } else if (inputString === 'Admin') {
        return UserRoles.ADMIN;
    } else if (inputString === 'Premium') {
        return UserRoles.PREMIUM;
    } else {
        const {logError} = require('../utils');

        logError('LOG(userRole.js): ', 'Invalid input string.');
        return null;
    }
}


module.exports = {UserRoles, 
                  fromStringToUserRoles};
  