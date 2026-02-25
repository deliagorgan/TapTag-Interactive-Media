const { findCommentsByPostID,
        findPostByID,
        addComment,
        deleteComment, 
        findCommentByID,
        findUserByID,
        addCommentNotification,
        addGenericNotification} = require('../../database/operations');

const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, isValid} = require('../utils');
const {canDeleteComment, canUpdateComment} = require('../access_logic/commentPermissions.js');
const { sendNotificationToUser } = require('../utils/socketOperations');
const { UserRoles } = require('../constants/userRole.js');

const prefix = "LOG(commentController.js): ";

/*
    functie care creaza un comentariu pt o anumita postare
*/
async function createComment(req, res) {
    try {
        const {postID, text} = req.body;
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
            se creaza comentariul
        */
        const comment = await addComment({ userID: currentUserID,
                                          postID: postID,
                                          text: text
        });

        if (!comment)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la adaugarea comentariului."});


        /*
            se creaza si o notificare pentru utilizatorul care a postat imaginea si se trimite la frontend
            aceasta notificare se creaza doar daca cel care scrie comentariul nu este cel care a postat postarea
        */
        if (currentUserID != post.userID) {
            result = await addCommentNotification({
                commentID: comment.id,
                recipientID: post.userID
            });
    
            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut crea notificarea pt comentariul dat!"});

            const user = await findUserByID(currentUserID);
            
            sendNotificationToUser(post.userID, {
                type: 'comment',
                notificationID: result.id,
                likeID: comment.id,
                postID: postID,
                fromUserID: currentUserID,
                username: user.username,
                text: text,
                createdAt: result.createdAt
            });
        }

        return res.status(HTTPStatus.OK).json({ id: comment.id, message: "Comentariul a fost adaugat!" , comment});
    } catch (err) {
        logError(prefix, `Error while creating comment: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza toate comentariile de la o anumita postare
*/
async function getAllComments(req, res) {
    try {
        const postID = req.params.postID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Postarea nu exista!" });

        /*
            se extrag comentariile asociate cu postarea
        */
        const comments = await findCommentsByPostID(postID);

        //logSuccess(prefix, `Pentru postarea ${postID} au fost gasite ${comments.length} comentarii.`);

        return res.status(HTTPStatus.OK).json(comments);
    } catch (err) {
        logError(prefix, `Error while adding comment: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza un comentariu pe baza id-ului
*/
async function getCommentByID(req, res) {
    try {
        const commentID = req.params.commentID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrage comentariul
        */
        const comment = await findCommentByID(commentID);

        //logSuccess(prefix, `Pentru postarea ${postID} au fost gasite ${comments.length} comentarii.`);

        return res.status(HTTPStatus.OK).json(comment);
    } catch (err) {
        logError(prefix, `Error while adding comment: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care verifica daca un comentariu de la o anumita postare poate fi sters
*/
async function checkDeletePermission(req, res) {
    try {
        const postID = req.params.postID;
        const commentID = req.params.commentID;

        /*
            se verifica daca token-ul exista sau este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.OK).json({ permission: false,
                                                    message: "Token invalid!" });

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.OK).json({ permission: false,
                                                    message: "Postarea nu exista!" });


        /*
            se verifica daca utilizatorul poate sterge
        */
        let result = await canDeleteComment(userID, commentID, postID);

        if (!result)
            return res.status(HTTPStatus.OK).json({ permission: false,
                                                    message: "Utilizatorul nu are voie sa stearga!" });


        return res.status(HTTPStatus.OK).json({ permission: true,
                                                message: `Utilizatorul poate sterge comentariul.`});
    } catch (err) {
        logError(prefix, `Error while deleting comment: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({permission: false,
                                                                    message: err.message});
    }
}

/*
    functie care sterge un comentariu de la o anumita postare
*/
async function deleteCommentByID(req, res) {
    try {
        const postID = req.params.postID;
        const commentID = req.params.commentID;

        /*
            se verifica daca token-ul exista sau este valid si se extrage utilizatorul
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        const user = await findUserByID(userID);

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Postarea nu exista!" });

        /*
            se verifica daca utilizatorul poate sterge
        */
        let result = await canDeleteComment(userID, commentID, postID);

        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Utilizatorul nu are voie sa stearga!" });

        /*
            se extrage comentariul si autorul postarii
        */
        const comment = await findCommentByID(commentID);

        if (!comment)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista un comentariu cu acest ID!" });

        const postAuthor = await findUserByID(post.userID);

        /*
            se sterge comentariul
        */
        result = await deleteComment(commentID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la stergerea comentariului."});

        logSuccess(prefix, `Comment deleted.`);

        /*
            daca comentariul este sters de proprietar nu se mai trimite notificare
        */
        if (userID === comment.userID)
            return res.status(HTTPStatus.OK).json({message: `Comment deleted with id ${commentID}`});

        /*
            mesajul difera in functie de persoana care a sters comentariul
        */
        let username = null;

        if (user.role === UserRoles.ADMIN) {
            username = 'an admin';
        } else if (userID === post.userID) {
            text = postAuthor.username;
        }

        /*
            se creaza o notificare catre persoana care a postat comentariul
        */
        const notification = await addGenericNotification({
            recipientID: comment.userID,
            text: `A comment written by you has been deleted by ${username}!`
        });

        if (!notification)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la crearea notificarii."});

        /*
            se trimite catre frotend notificarea prin socket
        */
        sendNotificationToUser(comment.userID, {
            type: 'generic',
            notificationID: notification.id,
            text: `A comment written by you has been deleted by ${username}!`,
            createdAt: notification.createdAt
        });

        return res.status(HTTPStatus.OK).json({message: `Comment deleted with id ${commentID}`});
    } catch (err) {
        logError(prefix, `Error while deleting comment: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care sterge un comentariu de la o anumita postare
*/
async function deleteReportedCommentByID(req, res) {
    try {
        const commentID = req.params.commentID;
        const reporterID = req.params.reporterID;

        /*
            se verifica daca token-ul exista sau este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });
    
        /*
            se verifica daca utlizatorul care a facut cerere este admin
        */
        const user = await findUserByID(userID);

        if (user.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu esti admin!" });

        /*
            se verifica daca comentariul exista
        */
        const comment = await findCommentByID(commentID);

        if (!comment)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista un comentariu cu acest ID!" });

        /*
            se extrage utilizatorul care a postat comentariul
        */
        const author = await findUserByID(comment.userID);
    
        /*
            se sterge comentariul
        */
        const result = await deleteComment(commentID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la stergerea comentariului."});

        /*
            se trimite o notificare catre persoana care a dat report-ul
        */
        let notification = await addGenericNotification({
            recipientID: reporterID,
            text: `The comment you reported and written by ${author.username} has been deleted!`
        });

        if (!notification)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la crearea notificarii."});

        /*
            se trimite catre frotend notificarea prin socket
        */
        sendNotificationToUser(reporterID, {
            type: 'generic',
            notificationID: notification.id,
            text: `The comment you reported and written by ${author.username} has been deleted!`,
            createdAt: notification.createdAt
        });

        /*
            se trimite o notificare catre persoana care postat comentariul
        */
        notification = await addGenericNotification({
            recipientID: author.id,
            text: `A comment written by you has been deleted by an admin!`
        });

        if (!notification)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la crearea notificarii."});

        /*
            se trimite catre frotend notificarea prin socket
        */
        sendNotificationToUser(author.id, {
            type: 'generic',
            notificationID: notification.id,
            text: `A comment written by you has been deleted by an admin!`,
            createdAt: notification.createdAt
        });
        

        logSuccess(prefix, `Comment deleted.`);

        return res.status(HTTPStatus.OK).json({message: `Comment deleted with id ${commentID}`});
    } catch (err) {
        logError(prefix, `Error while deleting comment: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care modifica un comentariu de la o anumita postare
    doar utilizatorul care a postat comentariul poate sa-l stearga
*/
async function updateCommentByID(req, res) {
    try {
        const postID = req.params.postID;
        const {commentID, text} = req.body;

        /*
            se verifica daca token-ul exista sau este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Postarea nu exista!" });


        /*
            se verifica daca utilizatorul poate sterge
        */
        let result = await canUpdateComment(userID, commentID);

        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Utilizatorul nu are voie sa modifice!" });

        /*
            se modifica comentariul
        */
        result = await updateComment(commentID, { text: text });

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la stergerea comentariului."});

        //logSuccess(prefix, `Comment changed with success.`);

        return res.status(HTTPStatus.OK).json({message: `Comment changed with id ${commentID}`});
    } catch (err) {
        logError(prefix, `Error while adding comment: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

module.exports = {getAllComments,
                  createComment,
                  getCommentByID,
                  checkDeletePermission,
                  deleteReportedCommentByID,
                  deleteCommentByID,
                  updateCommentByID};
