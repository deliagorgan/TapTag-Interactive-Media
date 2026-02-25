const sequelize = require('../db.js');
const { FollowNotification, User, Follower } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(followNotificationOperations.js): ";

/*
    functie care adauga o notificare pentru un follow dat pentru un anumit utilizator
*/
async function addFollowNotification(followNotification) {
    try {
        const result = await FollowNotification.create({
            followID: followNotification.followID,
            recipientID: followNotification.recipientID
        });

        if (!result)
            return null;

        logSuccess(prefix, `Follow notification added to user ${followNotification.recipientID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding follow notification: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza o notificare a unui follow dupa id
*/
async function findFollowNotificationByID(id) {
    try {

        return await FollowNotification.findByPk(id);

    } catch (err) {
        logError(prefix, `Error while searching for follow notification ${id}: ${err}`);
        return null;
    }
}


/*
    functie care gaseste notificarile de follow adresate utilizatorului cu id-ul dat
*/
async function findFollowNotificationsByRecipientID(recipientID) {
    try {

        return await FollowNotification.findAll({
            where: { recipientID },
            include: [{
                model: Follower,
                as: 'follow',
                include: [{
                    model: User,
                    as: 'followerUser',
                    }
                ]
            }]
        });

    } catch (err) {
        logError(prefix, `Error while searching for follow notifications for the user ${recipientID}: ${err}`);
        return null;
    }
}


/*
    functie care seteaza o notificare ca fiind vizualizata
*/
async function updateFollowNotificationStatusByID(notificationID) {
    try {

        return await FollowNotification.update(
            { isRead: true },
            { where: { id: notificationID } }
        );

    } catch (err) {
        logError(prefix, `Error while changing the status for the follow notification with ID ${recipientID}: ${err}`);
        return null;
    }
}


/*
    functie care sterge o notificare pt un follow
*/
async function deleteFollowNotification(id) {
    try {
        const result = await FollowNotification.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} follow notification(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting follow notification: ${err}.`);
        return false;
    }
}

module.exports = {
    addFollowNotification,
    findFollowNotificationByID,
    findFollowNotificationsByRecipientID,
    updateFollowNotificationStatusByID,
    deleteFollowNotification
};
