const { addLike, 
        findPostByID,
        deleteLike,
        findLikesByPostID,
        addLikeNotification,
        findLikesByUserAndPostID, 
        findUserByID} = require('../../database/operations');
const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, isValid} = require('../utils');
const { sendNotificationToUser } = require('../utils/socketOperations');

const prefix = "LOG(likeController.js): ";

/*
    functie care creaza un like pt o anumita postare
*/
async function createLike(req, res) {
    try {
        const {postID} = req.body;

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
            se verifica faptul ca user-ul nu a mai adaugat un like la aceeasi postare
        */
        let result = await findLikesByUserAndPostID(currentUserID, postID);

        if (result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Ai adaugat deja un like la aceasta postare"});


        /*
            se creaza like-ul
        */
        const like = await addLike({ userID: currentUserID,
                                postID: postID
        });

        if (!like)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut crea like-ul!"});

        /*
            se creaza si o notificare pentru utilizatorul care a postat imaginea si se trimite la frontend
            aceasta notificare se creaza doar daca cel care da like nu este cel care a postat postarea
        */
        if (currentUserID != post.userID) {
            result = await addLikeNotification({
                likeID: like.id,
                recipientID: post.userID
            });
    
            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut crea notificarea pt like-ul dat!"});

            const user = await findUserByID(currentUserID);

            logSuccess(prefix, `like from ${user.username}`);
            
            sendNotificationToUser(post.userID, {
                type: 'like',
                notificationID: result.id,
                likeID: like.id,
                postID: postID,
                fromUserID: currentUserID,
                username: user.username,
                createdAt: result.createdAt
            });
        }

        return res.status(HTTPStatus.OK).json({ message: "Like-ul a fost adaugat!" });
    } catch (err) {
        logError(prefix, `Error while creating like: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza toate like-urile de la o anumita postare
*/
async function getAllLikes(req, res) {
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
            se extrag like-urile asociate cu postarea
        */
        const likes = await findLikesByPostID(postID);

        return res.status(HTTPStatus.OK).json(likes);
    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care sterge un like de la o anumita postare
*/
async function deleteLikeByID(req, res) {
    try {
        const postID = req.params.postID;

        /*
            se verifica daca token-ul exista sau este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            verifica daca like-ul exista
        */
        const like = await findLikesByUserAndPostID(currentUserID, postID);

        if (!like)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Like-ul nu exista!" });

        /*
            se sterge like-ul
        */
        const result = await deleteLike(like.id);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});

        logSuccess(prefix, `Like deleted.`);

        return res.status(HTTPStatus.OK).json({message: `Like deleted with id ${like.id}`});
    } catch (err) {
        logError(prefix, `Error while deleting like: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


module.exports = { getAllLikes,
                   createLike,
                   deleteLikeByID };
