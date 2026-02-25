const { User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');
const { UserRoles } = require('../../server/constants/userRole.js');


const prefix = "LOG(userOperations.js): ";

/*
    functie care adauga un user
*/
async function addUser(user) {
    try {
        // create a new user with all required fields
        const newUser = await User.create({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            profilePhotoID: user.profilePhotoID,
            role: user.role,
            description: user.description,
            DOB: user.DOB,
            gender: user.gender
        });

        if (!newUser)
            return null;

        logSuccess(prefix, `User added with ID: ${newUser.id}`);
        return newUser;
    } catch (err) {
        logError(prefix, `Error adding user: ${err}.`);
        return null;
    }
}


/*
    functie care cauta un user dupa id
*/
async function findUserByID(id) {
    try {

        return await User.findByPk(id);

    } catch (err) {
        logError(prefix, `Error while searching for user with id ${id}: ${err}.`);

        return null;
    }
}

/*
    functie care returneaza toti userii din sistem
*/
async function findAllUsers() {
    try {

        return await User.findAll({
            attributes: { exclude: ['password'] }
        });

    } catch (err) {
        logError(prefix, `Error while searching for all users: ${err}.`);

        return null;
    }
}


/*
    functie care returneaza toti userii care nu sunt admini din sistem
*/
async function findAllNonAdminUsers() {
    try {
        const { Op } = require('sequelize');

        return await User.findAll({
            where: {
                role: { [Op.ne]: 1 } 
            },
            attributes: { 
                exclude: ['password']
            }
        });

    } catch (err) {
        logError(prefix, `Error while searching for all users: ${err}.`);

        return null;
    }
}


/*
    functie care cauta un user dupa username
*/
async function findUserByUsername(username) {
    try {

        return await User.findOne({
            where: {username: username}
        });

    } catch (err) {
        logError(prefix, `Error while searching for user ${username}: ${err}.`);
        return null;
    }
}

/*
    functie care cauta un user dupa username
*/
async function findUsersByPartialUsername(username) {
    try {
        const { Op } = require('sequelize');

        return await User.findAll({
            where: {username: {
                [Op.startsWith]: username
              }}
        });

    } catch (err) {
        logError(prefix, `Error while searching for user ${username}: ${err}.`);
        return null;
    }
}


/*
    functie care cauta un userID dupa username
*/
async function findUserIDByUsername(username) {
    try {

        return (await User.findOne({
            where: {username: username}
        })).id;

    } catch (err) {
        logError(prefix, `Error while searching for user ${username}: ${err}.`);
        return null;
    }
}



/*
    functie care cauta un user dupa email
*/
async function findUserByEmail(email) {
    try {

        return await User.findOne({
            where: {email: email}
        });

    } catch (err) {
        logError(prefix, `Error while searching for user ${email}: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza toti utilizatorii adimin
*/
async function findAllAdminUsers() {
    try {

        return await User.findAll({
            where: {role: UserRoles.ADMIN}
        });

    } catch (err) {
        logError(prefix, `Error while searching for all the admin user: ${err}.`);
        return [];
    }
}


/*
    functie care cauta un user dupa token
*/
async function findUserByToken(token) {
    try {

        return await User.findOne({
            where: {token: token}
        });

    } catch (err) {
        logError(prefix, `Error while searching for user: ${err}.`);
        return null;
    }
}

/*
    functie care modifica un user
*/
async function updateUser(id, updateFields) {
    try {
        const result = await User.update(updateFields, { where: { id } });
        logSuccess(prefix, `Updated ${result[0]} user(s).`);
        return result;
    } catch (err) {
        logError(prefix, `Error updating user: ${err}.`);
        return null;
    }
}


/*
    functie care sterge un user
*/
async function deleteUser(id) {
    try {
        const result = await User.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} user(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting user: ${err}.`);

        return false;
    }
}

module.exports = {
    findUserByUsername,
    findUserByID,
    findAllUsers,
    findUserByToken,
    findUserIDByUsername,
    findUsersByPartialUsername,
    findAllNonAdminUsers,
    findAllAdminUsers,
    addUser,
    updateUser,
    deleteUser,
    findUserByEmail
};
