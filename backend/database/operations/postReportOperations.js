const sequelize = require('../db.js');
const { PostReport, Post, User } = require('../models/index.js');
const { logError, logSuccess }  = require('../../server/utils/index.js');

const prefix = "LOG(postReportOperations.js): ";


/*
    functie care adauga un raport pentru o postare
*/
async function addPostReport(data) {
    try {
        const result = await PostReport.create({
            postID: data.postID,
            reporterID: data.reporterID,
            reason: data.reason
        });

        if (!result)
            return null;

        logSuccess(prefix, `PostReport adaugat: postID ${data.postID}, reporterID ${data.reporterID}.`);
        return result;
    } catch (err) {
        logError(prefix, `Eroare la adaugare postReport: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza un raport de postare dupa id
*/
async function findPostReportByID(id) {
    try {
        return await PostReport.findByPk(id, {
            include: [
                { 
                    model: Post,
                    as: 'post'
                },
                { 
                    model: User,
                    as: 'reporter'
                }
            ]
        });
    } catch (err) {
        logError(prefix, `Eroare la cautare postReport ${id}: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza daca un user-ul cu id-ul dat a dat report la postarea cu id-ul dat
*/
async function findPostReportsByPostIDUserID(postID, userID) {
    try {
        return await PostReport.findOne({
            where: { postID, reporterID: userID },
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id','username']
                }
            ]
        });
    } catch (err) {
        logError(prefix, `Eroare la cautare rapoarte pentru post ${postID}: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza toate report-urile din sistem
*/
async function findAllPostReports() {
    try {
        return await PostReport.findAll({
            include: [
                { 
                    model: User,
                    as: 'reporter'
                },
                {
                    model: Post,
                    as: 'post'
                }
            ]
        });
    } catch (err) {
        logError(prefix, `Eroare la returnarea tuturor rapoartelor pentru postari: ${err}.`);
        return null;
    }
}


/*
    functie care gaseste toate rapoartele pentru o postare
*/
async function findPostReportsByPostID(postID) {
    try {
        return await PostReport.findAll({
            where: { postID },
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id','username']
                }
            ]
        });
    } catch (err) {
        logError(prefix, `Eroare la cautare rapoarte pentru post ${postID}: ${err}.`);
        return null;
    }
}

/*
    functie care verifica daca utilizatorul cu id-ul dat
    a dat un report la o postare
*/
async function findPostReportByReporterID(userID) {
    try {
        return await PostReport.findOne({
            where: { reporterID: userID }
        });
    } catch (err) {
        logError(prefix, `Eroare la cautare rapoartelor date de catre ${userID}: ${err}.`);
        return null;
    }
}

/*
    functie care verifica daca o postare a utilizatorului cu id-ul dat
    a fost raportata
*/
async function findPostReportByPostOwner(userID) {
    try {
        return await PostReport.findOne({
            include: [{
              model: Post,
              as: 'post',
              where: { userID }
            }]
        });
    } catch (err) {
        logError(prefix, `Eroare la cautarea rapoartelor pentru postarile utilizatorului ${userID}: ${err}.`);
        return null;
    }
}


/*
    functie care sterge un raport
*/
async function deletePostReport(id) {
    try {
        const deleted = await PostReport.destroy({ where: { id } });

        logSuccess(prefix, `Deleted ${deleted} postReport(s).`);
        return deleted > 0;
    } catch (err) {
        logError(prefix, `Eroare la stergere postReport ${id}: ${err}.`);
        return false;
    }
}

module.exports = {
    addPostReport,
    findPostReportByID,
    findAllPostReports,
    findPostReportsByPostIDUserID,
    findPostReportByReporterID,
    findPostReportByPostOwner,
    findPostReportsByPostID,
    deletePostReport
};
