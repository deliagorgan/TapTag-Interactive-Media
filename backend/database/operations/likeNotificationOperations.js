const sequelize = require('../db.js');
const { LikeNotification, Post, User, Like } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(likeNotificationOperations.js): ";

/*
    functie care adauga o notificare pentru like dat pentru o anumita postare
*/
async function addLikeNotification(likeNotification) {
    try {
        const result = await LikeNotification.create({
            likeID: likeNotification.likeID,
            recipientID: likeNotification.recipientID
        });

        if (!result)
            return null;

        logSuccess(prefix, `Like notification added to user ${likeNotification.recipientID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding like notification: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza o notificare a unui like dupa id
*/
async function findLikeNotificationByID(id) {
    try {

        return await LikeNotification.findByPk(id);

    } catch (err) {
        logError(prefix, `Error while searching for like notification ${id}: ${err}`);
        return null;
    }
}


/*
    functie care gaseste notificari ale like urilor dupa ID-ul userului catre care sunt adresate
*/
async function findLikeNotificationsByRecipientID(recipientID) {
    try {

        return await LikeNotification.findAll({
            where: {recipientID},
            include: [{
                model: Like, as: 'like' 
              }]
        });

    } catch (err) {
        logError(prefix, `Error while searching for like notifications for the user ${recipientID}: ${err}`);
        return null;
    }
}



/*
    functie care seteaza o notificare ca fiind vizualizata
*/
async function updateLikeNotificationStatusByID(notificationID) {
    try {

        return await LikeNotification.update(
            { isRead: true },
            { where: { id: notificationID } }
        );

    } catch (err) {
        logError(prefix, `Error while changing the status for the like notification with ID ${recipientID}: ${err}`);
        return null;
    }
}


/*
    functie care sterge o notificare pt un like
*/
async function deleteLikeNotification(id) {
    try {
        const result = await LikeNotification.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} like notification(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting like notification: ${err}.`);
        return false;
    }
}

module.exports = {
    addLikeNotification,
    findLikeNotificationByID,
    findLikeNotificationsByRecipientID,
    updateLikeNotificationStatusByID,
    deleteLikeNotification
};
