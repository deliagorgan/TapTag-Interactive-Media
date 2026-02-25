const { findCommentByID,
    findUserByID,
    findCommentReportByID,
    findAllAdminUsers,
    addCommentReportNotification,
    findCommentReportsByCommentIDUserID,
    deleteCommentReport,
    findCommentReportsByCommentID,
    addGenericNotification,
    addCommentReport,
    findAllCommentReports,
    findCommentReportByReporterID,
    findCommentReportByCommentOwner} = require('../../database/operations');
const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, isValid} = require('../utils');
const { sendNotificationToUser } = require('../utils/socketOperations');
const { UserRoles } = require('../constants/userRole.js');

const prefix = "LOG(commentReportController.js): ";

/*
    functie care creaza un report pt un anumit comentariu
    utilizatorii admin nu pot adauga report-uri
    nu poti sa dai report la propriul comentariu
*/
async function createCommentReport(req, res) {
    try {
        const {commentID, reason} = req.body;

        /*
            se verifica daca token-ul exista si este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca comentariul exista
        */
        const comment = await findCommentByID(commentID);

        if (!comment)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Comentariul nu exista!" });

        /*
            se verifica daca utilizatorul nu este Admin sau daca este comentariul sau
        */
        const user = await findUserByID(currentUserID);

        if (user.role === UserRoles.ADMIN || currentUserID === comment.userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Utilizatorii admin nu pot adauga report-uri!" });

        /*
            se creaza report-ul
        */
        const report = await addCommentReport({ 
            reporterID: currentUserID,
            commentID,
            reason
        });

        if (!report)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut creea report-ul!"});

        /*
            se extrage utilizatorul care a creat comentariul
        */
        const commentAuthor = await findUserByID(comment.userID);

        /*
            se creaza cate o notificare pentru report-ul creat
            fiecare admin primeste o notificare
        */
        const admins = await findAllAdminUsers();

        if (!Array.isArray(admins) || admins.length === 0) {
            return res.status(HTTPStatus.OK).json({id: report.id,  message: "Report-urile au fost adaugate!" });
        }

        for (const admin of admins) {
            /*
                se creaza notificarea
            */
            const notification = await addCommentReportNotification({
                commentReportID: report.id,
                recipientID: admin.id
            });

            if (!notification)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut crea notificarea pentru report-ul facut!"});

            /*
                se trimite la frontend prin socket
            */
            const user = await findUserByID(currentUserID);
        
            sendNotificationToUser(admin.id, {
                type: 'commentReport',
                notificationID: notification.id,
                reportID: report.id,
                reason: reason,
                commentID: commentID,
                postID: comment.postID,
                fromUserID: currentUserID,
                username: commentAuthor.username,
                createdAt: notification.createdAt
            });
        }

        return res.status(HTTPStatus.OK).json({id: report.id, message: "Report-ul a fost adaugat!" });
    } catch (err) {
        logError(prefix, `Error while creating a comment report: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza toate reporturile destinate unui anumit admin
*/
async function getAllCommentReports(req, res) {
    try {
        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrage utilizatorul
        */
        const user = await findUserByID(userID);

        if (user.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Doar utilizatorii admin pot vizualiza report-urile!" });

        /*
            se extrag report-urile asociate cu utilzatorul
        */
        const reports = await findAllCommentReports();

        return res.status(HTTPStatus.OK).json(reports);
    } catch (err) {
        logError(prefix, `Error while getting comment reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza daca utilizatorul logat a dat deja report la commentarea respectiva
*/
async function getCommentReportsByCommentIDAndCurrentUser(req, res) {
    try {
        const commentID = req.params.commentID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrage commentarea pt ID-ul dat
        */
        const comment = await findCommentByID(commentID);

        if (!comment)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Commentarea cu ID-ul dat nu exista!" });

        /*
            pentru utilizatorul care a adaugat commentarea nu poate sa dea report
            sau daca este admin
        */
        const user = await findUserByID(userID);

        if (userID === comment.userID || user.role === UserRoles.ADMIN)
            return res.status(HTTPStatus.OK).json({owned: 'myComment'});

        /*
            se extrag report-urile asociate cu utilizatorul
        */
        const report = await findCommentReportsByCommentIDUserID(commentID, userID);

        return res.status(HTTPStatus.OK).json(report);
    } catch (err) {
        logError(prefix, `Error while getting comment reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza toate report-urile asociate commentariului dat
*/
async function getAllCommentReportsByCommentID(req, res) {
    try {
        const commentID = req.params.commentID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrag report-urile asociate cu utilizatorul
        */
        const reports = await findCommentReportsByCommentID(commentID);

        return res.status(HTTPStatus.OK).json(reports);
    } catch (err) {
        logError(prefix, `Error while getting comment reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza daca utilizatorul dat a raportat vreun comentariu
*/
async function checkIfUserHasReported(req, res) {
    try {
        const userID = req.params.userID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca este admin utilizatorul curent
        */
        const currentUser = await findUserByID(currentUserID);

        if (currentUser.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu esti admin!" });

        /*
            se extrag report-urile asociate cu utilizatorul
        */
        const report = await findCommentReportByReporterID(userID);

        return res.status(HTTPStatus.OK).json(report);
    } catch (err) {
        logError(prefix, `Error while getting comment reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza daca utilizatorul dat are vreun comentariu raportat
*/
async function checkIfUserHasBeenReported(req, res) {
    try {
        const userID = req.params.userID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca este admin utilizatorul curent
        */
        const currentUser = await findUserByID(currentUserID);

        if (currentUser.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu esti admin!" });

        /*
            se extrag report-urile asociate cu utilizatorul
        */
        const report = await findCommentReportByCommentOwner(userID);

        return res.status(HTTPStatus.OK).json(report);
    } catch (err) {
        logError(prefix, `Error while getting comment reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge un report de la o anumita commentare
    in acest caz report-ul a fost ignorat
*/
async function deleteCommentReportByID(req, res) {
    try {
        const reportID = req.params.reportID;

        /*
            se verifica daca token-ul exista sau este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            verifica daca report-ul exista
        */
        const report = await findCommentReportByID(reportID);

        if (!report)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Report-ul nu exista!" });

        /*
            se verifica daca utilizatorul este Admin
        */
        const user = await findUserByID(currentUserID);

        if (user.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Doar utilizatorii admin pot vizualiza report-urile!" });
        /*
            se obtine comentariul raportat si username ul utilizatorului care l-a adaugat
        */
        const comment = await findCommentByID(report.commentID);

        const commentOwner = await findUserByID(comment.userID);

        /*
            se sterge report-ul
        */
        const result = await deleteCommentReport(reportID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut sterge repor-ul!"});

        logSuccess(prefix, `Report deleted.`);

        /*
            se trimite o notificare catre utilizatorul care a creat report-ul
        */
        const notification = await addGenericNotification({
            recipientID: report.reporter.id,
            text: `The report to ${commentOwner.username}'s comment has been ignored.`
        });

        if (!notification)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut crea notificarea!"});

        logSuccess(prefix, `Sendion to use ${report.reporter.id}`);
        /*
            se trimite si catre frontend o notificare catre socket
        */    
        sendNotificationToUser(report.reporter.id, {
            type: 'generic',
            notificationID: notification.id,
            text: `The report to ${commentOwner.username}'s comment has been ignored.`,
            createdAt: notification.createdAt
        });

        return res.status(HTTPStatus.OK).json({message: `Report deleted with id ${reportID}`});
    } catch (err) {
        logError(prefix, `Error while deleting report: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


module.exports = { getAllCommentReports,
                    deleteCommentReportByID,
                    getAllCommentReportsByCommentID,
                    getCommentReportsByCommentIDAndCurrentUser,
                    checkIfUserHasReported,
                    checkIfUserHasBeenReported,
                    createCommentReport };
