const {UserRoles} = require('../constants/userRole.js');
const { findCommentByID,
        findPostByID,
        findUserByID} = require('../../database/operations');
const { logSuccess, logError } = require('../utils/logConsole.js');

const prefix = "LOG(commentPermissions.js): ";

/*
    functie care verifica daca operatia de stergere a comentariului
    poate fi efectuata de utilizatorul logat
    cel care a postat poate sa stearga
    cel care a postat imaginea poate sa stearga
    adminii pot sa steagra
*/
async function canDeleteComment(userID, commentID, postID) {

    const user = await findUserByID(userID);

    if (!user)
        return false;

    /*
        se verifica daca user-ul este Admin
    */
    if (user.role === UserRoles.ADMIN)
        return true;


    /*
        se verifica daca user-ul este propietarul comentariului
    */
    const comment = await findCommentByID(commentID);

    if (!comment)
        return false;


    if (comment.userID === user.id)
        return true;

    /*
        se verifica daca user-ul este proprietarul postarii
    */
    const post = await findPostByID(postID);

    if (!post)
        return false;

    if (post.userID === user.id)
        return true;

    return false;
}

/*
    functie care verifica daca operatia de modificare a comentariului
    paote fi efectuata de utilizatorul logat
*/
async function canUpdateComment(userID, commentID) {
    const user = await findUserByID(userID);

    if (!user)
        return false;

    /*
        se verifica daca user-ul este propietarul comentariului
    */
    const comment = await findCommentByID(commentID);

    if (!comment)
        return false;

    if (comment.userID === user.id)
        return true;

    return false;
}

module.exports = { canDeleteComment,
                   canUpdateComment };
