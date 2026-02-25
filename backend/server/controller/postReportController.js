const { findPostByID,
    findUserByID,
    findPostReportByID,
    findAllAdminUsers,
    addPostReportNotification,
    findPostReportsByPostIDUserID,
    deletePostReport,
    findPostReportsByPostID,
    addGenericNotification,
    addPostReport,
    findAllPostReports,
    findPostReportByReporterID,
    findPostReportByPostOwner} = require('../../database/operations');
const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, isValid} = require('../utils');
const { sendNotificationToUser } = require('../utils/socketOperations');
const { UserRoles } = require('../constants/userRole.js');

const prefix = "LOG(postReportController.js): ";

/*
    functie care creaza un report pt o anumita postare
    utilizatorii admin nu pot adauga report-uri
    nu poti sa dai report la propria postare
*/
async function createPostReport(req, res) {
    try {
        logSuccess(prefix, req.body);
        const {postID, reason} = req.body;

        /*
            se verifica daca token-ul exista si este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Postarea nu exista!" });

        /*
            se verifica daca utilizatorul nu este Admin sau daca este postarea sa
        */
        const user = await findUserByID(currentUserID);

        if (user.role === UserRoles.ADMIN || currentUserID === post.userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Utilizatorii admin nu pot adauga report-uri!" });

        /*
            se creaza report-ul
        */
        const report = await addPostReport({ 
            reporterID: currentUserID,
            postID,
            reason
        });

        if (!report)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut creea report-ul!"});

        /*
            se extrage utilizatorul care a creat postarea
        */
        const postAuthor = await findUserByID(post.userID);

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
            const notification = await addPostReportNotification({
                postReportID: report.id,
                recipientID: admin.id
            });

            if (!notification)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut creea notificarea pentru report-ul facut!"});

            /*
                se trimite la frontend prin socket
            */
            const user = await findUserByID(currentUserID);
        
            sendNotificationToUser(admin.id, {
                type: 'postReport',
                notificationID: notification.id,
                reportID: report.id,
                reason: reason,
                postID: postID,
                fromUserID: currentUserID,
                username: postAuthor.username,
                createdAt: notification.createdAt
            });
        }

        return res.status(HTTPStatus.OK).json({id: report.id, message: "Report-ul a fost adaugat!" });
    } catch (err) {
        logError(prefix, `Error while creating a post report: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza toate reporturile
*/
async function getAllPostReports(req, res) {
    try {
        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrage utilizatorul si se verifica ca este admin
        */
        const user = await findUserByID(userID);

        if (user.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Doar utilizatorii admin pot vizualiza report-urile!" });

        /*
            se extrag toate report-urile
        */
        const reports = await findAllPostReports();

        return res.status(HTTPStatus.OK).json(reports);
    } catch (err) {
        logError(prefix, `Error while getting post reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza daca utilizatorul logat a dat deja report la postarea respectiva
*/
async function getPostReportsByPostIDAndCurrentUser(req, res) {
    try {
        const postID = req.params.postID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrage postarea pt ID-ul dat
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Postarea cu ID-ul dat nu exista!" });

        /*
            pentru utilizatorul care a adaugat postarea nu poate sa dea report
            sau daca este admin
        */
        const user = await findUserByID(userID);

        if (userID === post.userID || user.role === UserRoles.ADMIN)
            return res.status(HTTPStatus.OK).json({owned: 'true'});

        /*
            se extrag report-urile asociate cu utilizatorul
        */
        const report = await findPostReportsByPostIDUserID(postID, userID);

        return res.status(HTTPStatus.OK).json(report);
    } catch (err) {
        logError(prefix, `Error while getting post reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza toate report-urile asociate postarii date
*/
async function getAllPostReportsByPostID(req, res) {
    try {
        const postID = req.params.postID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrag report-urile asociate cu utilizatorul
        */
        const reports = await findPostReportsByPostID(postID);

        return res.status(HTTPStatus.OK).json(reports);
    } catch (err) {
        logError(prefix, `Error while getting post reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza daca utilizatorul dat a raportat vreo postare
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
        const report = await findPostReportByReporterID(userID);

        return res.status(HTTPStatus.OK).json(report);
    } catch (err) {
        logError(prefix, `Error while getting post reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza daca utilizatorul dat are vreo postare raportata
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
        const report = await findPostReportByPostOwner(userID);

        return res.status(HTTPStatus.OK).json(report);
    } catch (err) {
        logError(prefix, `Error while getting post reports: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge un report de la o anumita postare
    in acest caz report-ul a fost ignorat
*/
async function deletePostReportByID(req, res) {
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
        const report = await findPostReportByID(reportID);

        if (!report)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Report-ul nu exista!" });

        /*
            se verifica daca utilizatorul este Admin
        */
        const user = await findUserByID(currentUserID);

        if (user.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Doar utilizatorii admin pot vizualiza report-urile!" });

        /*
            se obtine postarea raportata si username-ul utilizatorului care a adaugat-o
        */
        const post = await findPostByID(report.postID);

        const postOwner = await findUserByID(post.userID);

        /*
            se sterge report-ul
        */
        const result = await deletePostReport(reportID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut sterge repor-ul!"});

        logSuccess(prefix, `Report deleted.`);

        /*
            se trimite o notificare catre utilizatorul care a creat report-ul
        */
        const notification = await addGenericNotification({
            recipientID: report.reporter.id,
            text: `The report to ${postOwner.username}'s post has been ignored.`
        });

        if (!notification)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut crea notificarea!"});

        /*
            se trimite si catre frontend o notificare catre socket
        */    
        sendNotificationToUser(report.reporter.id, {
            type: 'generic',
            notificationID: notification.id,
            text: `The report to ${postOwner.username}'s post has been ignored.`,
            createdAt: notification.createdAt
        });

        return res.status(HTTPStatus.OK).json({message: `Report deleted with id ${reportID}`});
    } catch (err) {
        logError(prefix, `Error while deleting report: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


module.exports = { getAllPostReports,
                    deletePostReportByID,
                    getAllPostReportsByPostID,
                    getPostReportsByPostIDAndCurrentUser,
                    checkIfUserHasReported,
                    checkIfUserHasBeenReported,
                    createPostReport };
