const sequelize = require('../db.js');
const { GenericNotification } = require('../models/index.js');
const { logError, logSuccess } = require('../../server/utils/index.js');

const prefix = "LOG(genericNotificationOperations.js): ";

/*
    functie care adauga o notificare de stergere
*/
async function addGenericNotification(data) {
    try {
        const result = await GenericNotification.create({
            recipientID: data.recipientID,
            text: data.text
        });

        if (!result)
            return null;

        logSuccess(prefix, `GenericNotification added to user ${data.recipientID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding genericNotification: ${err}.`);
        return null;
    }
}

/*
    functie care returneaza o notificare stergere dupa id
*/
async function findGenericNotificationByID(id) {
    try {
        return await GenericNotification.findByPk(id);
    } catch (err) {
        logError(prefix, `Error finding genericNotification ${id}: ${err}`);
        return null;
    }
}

/*
    functie care gaseste notificari stergere dupa recipientID
*/
async function findGenericNotificationsByRecipientID(recipientID) {
    try {
        return await GenericNotification.findAll({
            where: { recipientID }
        });
    } catch (err) {
        logError(prefix, `Error finding genericNotifications for user ${recipientID}: ${err}`);
        return null;
    }
}

/*
    functie care actualizeaza statusul unei notificari
*/
async function updateGenericNotificationStatusByID(id) {
    try {
        return await GenericNotification.update(
            { isRead: true },
            { where: { id } }
        );
    } catch (err) {
        logError(prefix, `Error updating genericNotification ${id}: ${err}`);
        return null;
    }
}

/*
    functie care sterge o notificare
*/
async function deleteGenericNotification(id) {
    try {
        const result = await GenericNotification.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} genericNotification(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting genericNotification ${id}: ${err}.`);
        return false;
    }
}

module.exports = {
    addGenericNotification,
    findGenericNotificationByID,
    findGenericNotificationsByRecipientID,
    updateGenericNotificationStatusByID,
    deleteGenericNotification
};
