const sequelize = require('../db.js');
const { CommentNotification, Post, User, Comment } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(commentNotificationOperations.js): ";

/*
    functie care adauga o notificare pentru un comentariu dat pentru o anumita postare
*/
async function addCommentNotification(commentNotification) {
    try {
        const result = await CommentNotification.create({
            commentID: commentNotification.commentID,
            recipientID: commentNotification.recipientID
        });

        if (!result)
            return null;

        logSuccess(prefix, `Comment notification added to user ${commentNotification.recipientID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding comment notification: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza un o notificare a unui comentariu dupa id
*/
async function findCommentNotificationByID(id) {
    try {

        return await CommentNotification.findByPk(id);

    } catch (err) {
        logError(prefix, `Error while searching for comment notification ${id}: ${err}`);
        return null;
    }
}


/*
    functie care gaseste notificari ale comentariilor dupa ID-ul userului catre care sunt adresate
*/
async function findCommentNotificationsByRecipientID(recipientID) {
    try {

        return await CommentNotification.findAll({
            where: {recipientID},
            include: [{ model: Comment, as: 'comment' }]
        });

    } catch (err) {
        logError(prefix, `Error while searching for comment notifications for the user ${recipientID}: ${err}`);
        return null;
    }
}


/*
    functie care seteaza o notificare ca fiind vizualizata
*/
async function updateCommentNotificationStatusByID(notificationID) {
    try {

        return await CommentNotification.update(
            { isRead: true },
            { where: { id: notificationID } }
        );

    } catch (err) {
        logError(prefix, `Error while changing the status for the comment notification with ID ${recipientID}: ${err}`);
        return null;
    }
}


/*
    functie care sterge o notificare pt un comentariu
*/
async function deleteCommentNotification(id) {
    try {
        const result = await CommentNotification.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} comment notification(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting comment notification: ${err}.`);
        return false;
    }
}

module.exports = {
    addCommentNotification,
    findCommentNotificationByID,
    findCommentNotificationsByRecipientID,
    updateCommentNotificationStatusByID,
    deleteCommentNotification
};
