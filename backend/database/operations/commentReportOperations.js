const sequelize = require('../db.js');
const { CommentReport, Comment, User } = require('../models/index.js');
const { logError, logSuccess }    = require('../../server/utils/index.js');

const prefix = "LOG(commentReportOperations.js): ";

/*
    functie care adauga un raport pentru un comentariu
*/
async function addCommentReport(data) {
    try {
        const result = await CommentReport.create({
            commentID: data.commentID,
            reporterID: data.reporterID,
            reason: data.reason
        });

        if (!result)
            return null;

        logSuccess(prefix, `CommentReport adaugat: comment ${data.commentID}, reporter ${data.reporterID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Eroare la adaugare commentReport: ${err}.`);
        return null;
    }
}

/*
    functie care returneaza un raport de comentariu dupa id
*/
async function findCommentReportByID(id) {
    try {
        return await CommentReport.findByPk(id, {
            include: [
                { 
                    model: Comment,
                    as: 'comment'
                },
                { 
                    model: User,
                    as: 'reporter'
                }
            ]
        });
    } catch (err) {
        logError(prefix, `Eroare la cautare commentReport ${id}: ${err}.`);
        return null;
    }
}

/*
    functie care gaseste toate rapoartele pentru un comentariu
*/
async function findCommentReportsByCommentID(commentID) {
    try {
        return await CommentReport.findAll({
            where: { commentID },
            include: [
                { 
                    model: User,
                    as: 'reporter'
                }
            ]
        });
    } catch (err) {
        logError(prefix, `Eroare la cautare rapoarte pentru comment ${commentID}: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza toate report-urile din sistem
*/
async function findAllCommentReports() {
    try {
        return await CommentReport.findAll({
            include: [
                { 
                    model: User,
                    as: 'reporter'
                },
                {
                    model: Comment,
                    as: 'comment',
                    include: [
                        {
                          model: User,
                          as: 'author'
                        }
                    ]
                }
            ]
        });
    } catch (err) {
        logError(prefix, `Eroare la returnarea tuturor rapoartelor pentru comentarii: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza daca utilizatorul dat a dat report la comentariul dat
*/
async function findCommentReportsByCommentIDUserID(commentID, userID) {
    try {
        return await CommentReport.findOne({
            where: { commentID, reporterID: userID },
            include: [
                { 
                    model: User,
                    as: 'reporter'
                }
            ]
        });
    } catch (err) {
        logError(prefix, `Eroare la cautare rapoarte pentru comment ${commentID}: ${err}.`);
        return null;
    }
}


/*
    functie care verifica daca utilizatorul cu id-ul dat
    a dat un report la un comentariu
*/
async function findCommentReportByReporterID(userID) {
    try {
        return await CommentReport.findOne({
            where: { reporterID: userID }
        });
    } catch (err) {
        logError(prefix, `Eroare la cautare report-urilor date de catre ${userID}: ${err}.`);
        return null;
    }
}

/*
    functie care verifica daca un comentariu al utilizatorului cu id-ul dat
    a fost raportat
*/
async function findCommentReportByCommentOwner(userID) {
    try {
        return await CommentReport.findOne({
            include: [{
              model: Comment,
              as: 'comment',
              where: { userID }
            }]
        });
    } catch (err) {
        logError(prefix, `Eroare la cautarea rapoartelor pentru comentariile utilizatorului ${userID}: ${err}.`);
        return null;
    }
}


/*
    functie care sterge un raport pt comentariu
*/
async function deleteCommentReport(id) {
    try {
        const deleted = await CommentReport.destroy({ where: { id } });

        logSuccess(prefix, `Deleted ${deleted} commentReport(s).`);

        return deleted > 0;
    } catch (err) {
        logError(prefix, `Eroare la stergere commentReport ${id}: ${err}.`);
        return false;
    }
}

module.exports = {
    addCommentReport,
    findCommentReportByID,
    findCommentReportsByCommentID,
    findAllCommentReports,
    findCommentReportsByCommentIDUserID,
    findCommentReportByReporterID,
    findCommentReportByCommentOwner,
    deleteCommentReport
};
