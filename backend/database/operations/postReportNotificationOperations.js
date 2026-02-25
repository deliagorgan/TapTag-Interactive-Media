const { PostReportNotification, PostReport } = require('../models/index.js');
const { logError, logSuccess } = require('../../server/utils/index.js');

const prefix = "LOG(postReportNotificationOperations.js): ";

/*
    functie care adauga o notificare de raportare pentru o postare
*/
async function addPostReportNotification(data) {
    try {
        const result = await PostReportNotification.create({
            postReportID: data.postReportID,
            recipientID: data.recipientID
        });

        if (!result) return null;

        logSuccess(
        prefix,
        `PostReportNotification added for report ${data.postReportID} to user ${data.recipientID}.`
        );
        return result;
    } catch (err) {
        logError(prefix, `Error adding PostReportNotification: ${err}.`);
        return null;
    }
}

/*
    functie care returneaza o notificare de raport postare dupa id
*/
async function findPostReportNotificationByID(id) {
    try {
        return await PostReportNotification.findByPk(id, {
            include: [{
                model: PostReport,
                as: 'postReport'
            }]
        });
    } catch (err) {
        logError(prefix, `Error finding PostReportNotification ${id}: ${err}`);
        return null;
    }
}


/*
    functie care gaseste toate notificari raport postare pentru un recipient
*/
async function findPostReportNotificationsByRecipientID(recipientID) {
    try {
        return await PostReportNotification.findAll({
        where: { recipientID },
        include: [{
            model: PostReport,
            as: 'postReport',
            include: [
                { association: 'post' },
                { association: 'reporter' }
            ]
        }]
        });
    } catch (err) {
        logError(
        prefix,
        `Error fetching PostReportNotifications for user ${recipientID}: ${err}`
        );
        return null;
    }
}


/*
    functie care marcheaza un raport de postare ca vizionat
*/
async function updatePostReportNotificationStatusByID(notificationID) {
    try {
        const [updatedCount] = await PostReportNotification.update(
            { isRead: true },
            { where: { id: notificationID } }
        );
        logSuccess(prefix, `Marked ${updatedCount} postReport(s) as read (id=${notificationID}).`);
        return updatedCount > 0;
    } catch (err) {
        logError(prefix, `Eroare la update status postReport ${notificationID}: ${err}.`);
        return false;
    }
}


/*
    functie care sterge o notificare raport postare
*/
async function deletePostReportNotification(id) {
    try {
        const deleted = await PostReportNotification.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${deleted} PostReportNotification(s).`);
        return deleted > 0;
    } catch (err) {
        logError(prefix, `Error deleting PostReportNotification ${id}: ${err}.`);
        return false;
    }
}

module.exports = {
    addPostReportNotification,
    findPostReportNotificationByID,
    findPostReportNotificationsByRecipientID,
    updatePostReportNotificationStatusByID,
    deletePostReportNotification
};
