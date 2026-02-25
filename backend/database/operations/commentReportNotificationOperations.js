const { CommentReportNotification, CommentReport } = require('../models/index.js');
const { logError, logSuccess } = require('../../server/utils/index.js');

const prefix = "LOG(commentReportNotificationOperations.js): ";

/*
    functie care adauga o notificare de raportare pentru un comentariu
*/
async function addCommentReportNotification(data) {
    try {
        const result = await CommentReportNotification.create({
        commentReportID: data.commentReportID,
        recipientID: data.recipientID
        });

        if (!result) return null;

        logSuccess(prefix, `CommentReportNotification added for report ${data.commentReportID} to user ${data.recipientID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding CommentReportNotification: ${err}.`);
        return null;
    }
}

/*
    functie care returneaza o notificare de raport comentariu dupa id
*/
async function findCommentReportNotificationByID(id) {
    try {
        return await CommentReportNotification.findByPk(id, {
        include: [{
            model: CommentReport,
            as: 'commentReport'
        }]
        });
    } catch (err) {
        logError(prefix, `Error finding CommentReportNotification ${id}: ${err}`);
        return null;
    }
}

/*
    functie care gaseste toate notificari raport comentariu pentru un recipient
*/
async function findCommentReportNotificationsByRecipientID(recipientID) {
    try {
        return await CommentReportNotification.findAll({
        where: { recipientID },
        include: [{
            model: CommentReport,
            as: 'commentReport',
            include: [
                { association: 'comment' },
                { association: 'reporter' }
            ]
        }]
        });
    } catch (err) {
        logError(prefix, `Error fetching notifications for user ${recipientID}: ${err}`);
        return null;
    }
}


/*
    functie care marcheaza un raport de comentariu ca fiind vizionat
*/
async function updateCommentReportNotificationStatusByID(notificationID) {
    try {
        const [updatedCount] = await CommentReportNotification.update(
            { isRead: true },
            { where: { id: notificationID } }
        );
        logSuccess(prefix, `Marked ${updatedCount} commentReport(s) as read (id=${notificationID}).`);
        return updatedCount > 0;
    } catch (err) {
        logError(prefix, `Eroare la update status commentReport ${notificationID}: ${err}.`);
        return false;
    }
}

/*
    functie care sterge o notificare raport comentariu
*/
async function deleteCommentReportNotification(id) {
    try {
        const deleted = await CommentReportNotification.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${deleted} CommentReportNotification(s).`);
        return deleted > 0;
    } catch (err) {
        logError(prefix, `Error deleting CommentReportNotification ${id}: ${err}.`);
        return false;
    }
}

module.exports = {
    addCommentReportNotification,
    findCommentReportNotificationByID,
    findCommentReportNotificationsByRecipientID,
    updateCommentReportNotificationStatusByID,
    deleteCommentReportNotification
};
