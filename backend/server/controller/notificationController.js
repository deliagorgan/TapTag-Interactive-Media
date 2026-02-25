const { findLikeNotificationsByRecipientID,
        findLikeNotificationByID,
        updateLikeNotificationStatusByID,
        deleteLikeNotification: deleteLikeNotificationByID,

        findCommentNotificationsByRecipientID,
        findCommentNotificationByID,
        updateCommentNotificationStatusByID,
        deleteCommentNotification: deleteCommentNotificationByID,

        findFollowNotificationsByRecipientID,
        findFollowNotificationByID,
        updateFollowNotificationStatusByID,
        deleteFollowNotification: deleteFollowNotificationByID,

        findPostNotificationsByRecipientID,
        findPostNotificationByID,
        updatePostNotificationStatusByID,
        deletePostNotification: deletePostNotificationByID,

        findGenericNotificationsByRecipientID,
        findGenericNotificationByID,
        updateGenericNotificationStatusByID,
        deleteGenericNotification: deleteGenericNotificationByID,

        findCommentReportNotificationsByRecipientID,
        findCommentReportNotificationByID,
        updateCommentReportNotificationStatusByID,
        deleteCommentReportNotification: deleteCommentReportNotificationByID,

        findPostReportNotificationsByRecipientID,
        findPostReportNotificationByID,
        updatePostReportNotificationStatusByID,
        deletePostReportNotification: deletePostReportNotificationByID } = require('../../database/operations');

const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, isValid} = require('../utils');

const prefix = "LOG(notificationController.js): ";


/*
    functie care returneaza toate notificarile destinate unui anumit utilizator
*/
async function getNotificationsByUserID(req, res) {
    try {

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });


        /*
            se construieste cererea cu toate notificarile
        */
        const likeNotifications = await findLikeNotificationsByRecipientID(currentUserID);
        const commentNotifications = await findCommentNotificationsByRecipientID(currentUserID);
        const followNotifications = await findFollowNotificationsByRecipientID(currentUserID);
        const postNotifications = await findPostNotificationsByRecipientID(currentUserID);
        const commentReportNotifications = await findCommentReportNotificationsByRecipientID(currentUserID);
        const postReportNotifications = await findPostReportNotificationsByRecipientID(currentUserID);
        const genericNotifications = await findGenericNotificationsByRecipientID(currentUserID);

        const notifications = {like: likeNotifications, 
            comment: commentNotifications,
            follow: followNotifications,
            post: postNotifications,
            commentReport: commentReportNotifications,
            postReport: postReportNotifications,
            generic: genericNotifications
        };

        return res.status(HTTPStatus.OK).json(notifications);
    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}



/*
    functie care seteaza notificarea data ca fiind vizualizata
*/
async function setLikeNotificationsAsViewed(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findLikeNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate modifica notificarea
            doar utilizatorul catre care este destinata poate modifica
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se seteaza notificarea ca fiind vizualizata
        */
        const result = await updateLikeNotificationStatusByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut si setata notificarea ca fiind vizualizata!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost vizualizata!"});
    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}



/*
    functie care seteaza notificarea data ca fiind vizualizata
*/
async function setCommentNotificationsAsViewed(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findCommentNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate modifica notificarea
            doar utilizatorul catre care este destinata poate modifica
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se seteaza notificarea ca fiind vizualizata
        */
        const result = await updateCommentNotificationStatusByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut si setata notificarea ca fiind vizualizata!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost vizualizata!"});
    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care seteaza notificarea data ca fiind vizualizata
*/
async function setPostNotificationsAsViewed(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findPostNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate modifica notificarea
            doar utilizatorul catre care este destinata poate modifica
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se seteaza notificarea ca fiind vizualizata
        */
        const result = await updatePostNotificationStatusByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut si setata notificarea ca fiind vizualizata!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost vizualizata!"});
    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care seteaza notificarea data ca fiind vizualizata
*/
async function setFollowNotificationsAsViewed(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findFollowNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate modifica notificarea
            doar utilizatorul catre care este destinata poate modifica
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se seteaza notificarea ca fiind vizualizata
        */
        const result = await updateFollowNotificationStatusByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut si setata notificarea ca fiind vizualizata!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost vizualizata!"});
    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care seteaza notificarea data ca fiind vizualizata
*/
async function setPostReportNotificationsAsViewed(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findPostReportNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate modifica notificarea
            doar utilizatorul catre care este destinata poate modifica
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se seteaza notificarea ca fiind vizualizata
        */
        const result = await updatePostReportNotificationStatusByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut si setata notificarea ca fiind vizualizata!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost vizualizata!"});
    } catch (err) {
        logError(prefix, `Error while getting post report notifications: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care seteaza notificarea data ca fiind vizualizata
*/
async function setCommentReportNotificationsAsViewed(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findCommentReportNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate modifica notificarea
            doar utilizatorul catre care este destinata poate modifica
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se seteaza notificarea ca fiind vizualizata
        */
        const result = await updateCommentReportNotificationStatusByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut si setata notificarea ca fiind vizualizata!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost vizualizata!"});
    } catch (err) {
        logError(prefix, `Error while getting comment report notifications: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care seteaza notificarea data ca fiind vizualizata
*/
async function setGenericNotificationsAsViewed(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findGenericNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate modifica notificarea
            doar utilizatorul catre care este destinata poate modifica
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se seteaza notificarea ca fiind vizualizata
        */
        const result = await updateGenericNotificationStatusByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut si setata notificarea ca fiind vizualizata!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost vizualizata!"});
    } catch (err) {
        logError(prefix, `Error while getting generic notifications: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}



/*
    functie care sterge notificarea data
*/
async function deleteLikeNotification(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findLikeNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate sterge notificarea
            doar utilizatorul catre care este destinata poate sterge
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se sterge notificarea
        */
        const result = await deleteLikeNotificationByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut fi stearsa notificarea!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost stearsa!"});
    } catch (err) {
        logError(prefix, `Error while deleting like notification: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge notificarea data
*/
async function deleteCommentNotification(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findCommentNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate sterge notificarea
            doar utilizatorul catre care este destinata poate sterge
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se sterge notificarea
        */
        const result = await deleteCommentNotificationByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut fi stearsa notificarea!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost stearsa!"});
    } catch (err) {
        logError(prefix, `Error while deleting comment notification: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge notificarea data
*/
async function deletePostNotification(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findPostNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate sterge notificarea
            doar utilizatorul catre care este destinata poate sterge
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se sterge notificarea
        */
        const result = await deletePostNotificationByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut fi stearsa notificarea!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost stearsa!"});
    } catch (err) {
        logError(prefix, `Error while deleting post notification: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge notificarea data
*/
async function deleteFollowNotification(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findFollowNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate sterge notificarea
            doar utilizatorul catre care este destinata poate sterge
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se sterge notificarea
        */
        const result = await deleteFollowNotificationByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut fi stearsa notificarea!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost stearsa!"});
    } catch (err) {
        logError(prefix, `Error while deleting follow notification: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge notificarea data
*/
async function deletePostReportNotification(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findPostReportNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate sterge notificarea
            doar utilizatorul catre care este destinata poate sterge
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se sterge notificarea
        */
        const result = await deletePostReportNotificationByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut fi stearsa notificarea!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost stearsa!"});
    } catch (err) {
        logError(prefix, `Error while deleting post report notification: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge notificarea data
*/
async function deleteCommentReportNotification(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findCommentReportNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate sterge notificarea
            doar utilizatorul catre care este destinata poate sterge
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se sterge notificarea
        */
        const result = await deleteCommentReportNotificationByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut fi stearsa notificarea!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost stearsa!"});
    } catch (err) {
        logError(prefix, `Error while deleting comment report notification: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge notificarea data
*/
async function deleteGenericNotification(req, res) {
    try {
        const notificationID = req.params.notificationID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca notificarea exista
        */
        const notification = await findGenericNotificationByID(notificationID);

        if (!notification)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista notificarea cu acest id!" });

        /*
            se verifica daca poate sterge notificarea
            doar utilizatorul catre care este destinata poate sterge
        */
        if (currentUserID != notification.recipientID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu ai acces la aceasta notificare!" });

        /*
            se sterge notificarea
        */
        const result = await deleteGenericNotificationByID(notificationID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut fi stearsa notificarea!" });

        return res.status(HTTPStatus.OK).json({message: "Notificarea a fost stearsa!"});
    } catch (err) {
        logError(prefix, `Error while deleting comment report notification: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}




module.exports = { 
    getNotificationsByUserID,

    setLikeNotificationsAsViewed,
    setCommentNotificationsAsViewed,
    setPostNotificationsAsViewed,
    setFollowNotificationsAsViewed,
    setPostReportNotificationsAsViewed,
    setCommentReportNotificationsAsViewed,
    setGenericNotificationsAsViewed,

    deleteLikeNotification,
    deleteCommentNotification,
    deletePostNotification,
    deleteFollowNotification,
    deletePostReportNotification,
    deleteCommentReportNotification,
    deleteGenericNotification,
 };
