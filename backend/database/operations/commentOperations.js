const { Comment, User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(commentOperations.js): ";

/*
    functie care adauga un comentariu
*/
async function addComment(comment) {
    try {
        
        const result = await Comment.create({
            userID: comment.userID,
            postID: comment.postID,
            text: comment.text
        });

        if (!result)
            return null;

        logSuccess(prefix, `Comment added to post ${comment.postID}`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding comment: ${err}`);
        return null;
    }
}


/*
    functie care returneaza un comentariu dupa id
    returneaza si userul care a scris
*/
async function findCommentByID(id) {
    try {

        return await Comment.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'profilePhotoID', 'DOB', 'gender']
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for comment ${id}: ${err}`);
        return null;
    }
}

/*
    functie care gaseste comentarii dupa postID
    returneaza si userul care a scris
*/
async function findCommentsByPostID(postID) {
    try {

        return await Comment.findAll({
            where: {postID: postID},
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'profilePhotoID', 'DOB', 'gender']
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for comments of post ${postID}: ${err}`);
        return null;
    }
}


/*
    functie care modifica un comentariu
*/
async function updateComment(id, updateFields) {
    try {
        const result = await Comment.update(updateFields, { where: { id } });
        logSuccess(prefix, `Updated ${result[0]} user(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error updating user: ${err}`);
        return false;
    }
}


/*
    functie care sterge un comentariu
*/
async function deleteComment(id) {
    try {
        const result = await Comment.destroy({ where: { id } });
        logSuccess(prefix, `Comment deleted.`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting comment: ${err}`);
        return false;
    }
}

module.exports = {
    findCommentByID,
    findCommentsByPostID,
    addComment,
    updateComment,
    deleteComment
};
