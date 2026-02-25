const sequelize = require('../db.js');
const { PostNotification, Post, User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(postNotificationOperations.js): ";

/*
    functie care adauga o notificare pentru o postare adaugata
*/
async function addPostNotification(postNotification) {
    try {
        const result = await PostNotification.create({
            postID: postNotification.postID,
            recipientID: postNotification.recipientID
        });

        if (!result)
            return null;

        logSuccess(prefix, `Post notification added to user ${postNotification.recipientID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding post notification: ${err}.`);
        return null;
    }
}

/*
    functie care returneaza o notificare a unei postari dupa id
*/
async function findPostNotificationByID(id) {
    try {

        return await PostNotification.findByPk(id);

    } catch (err) {
        logError(prefix, `Error while searching for post notification ${id}: ${err}`);
        return null;
    }
}


/*
    functie care gaseste notificari ale postarilor adaugate dupa ID-ul userului catre care sunt adresate
*/
async function findPostNotificationsByRecipientID(recipientID) {
    try {

        return await PostNotification.findAll({
            where: {recipientID},
            include: [{
                model: Post, as: 'post' 
            }]
        });

    } catch (err) {
        logError(prefix, `Error while searching for post notifications for the user ${recipientID}: ${err}`);
        return null;
    }
}



/*
    functie care seteaza o notificare ca fiind vizualizata
*/
async function updatePostNotificationStatusByID(notificationID) {
    try {

        return await PostNotification.update(
            { isRead: true },
            { where: { id: notificationID } }
        );

    } catch (err) {
        logError(prefix, `Error while changing the status for the post notification with ID ${recipientID}: ${err}`);
        return null;
    }
}


/*
    functie care sterge o notificare pt o postare
*/
async function deletePostNotification(id) {
    try {
        const result = await PostNotification.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} post notification(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting post notification: ${err}.`);
        return false;
    }
}

module.exports = {
    addPostNotification,
    findPostNotificationByID,
    findPostNotificationsByRecipientID,
    updatePostNotificationStatusByID,
    deletePostNotification
};
