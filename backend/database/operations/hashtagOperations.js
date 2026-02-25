const { Hashtag, Post } = require('../models/index.js');
const {logError, logSuccess } = require('../../server/utils');

const prefix = "LOG(hashtagOperations.js): ";

/*
    functie care adauga un hashtag
*/
async function addHashtag(hashtag) {
    try {

        const result = await Hashtag.create({
            name: hashtag.name
        });

        if (!result)
            return null;

        logSuccess(prefix, `Hashtag added.`);
        return result;
    } catch (err) {
        logError(prefix, `Error adding hashtag: ${err}.`);
        return null;
    }
}

/*
    functie care cauta un hashtag dupa id-ul lui
*/
async function findHashtagByID(id) {
    try {

        return await Hashtag.findByPk(id);

    } catch (err) {
        logError(prefix, `Error while searching for hashtag ${id}: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza daca un hashtag exista
    dupa numele acestuia
*/
async function hashtagExists(name) {
    try {

        return await Hashtag.findOne({
            where: {name: name}
        });

    } catch (err) {
        logError(prefix, `Error while checking if hashtag ${name} exists: ${err}`);
        return null;
    }
}


/*
    functie care cauta un hashtag dupa nume
    returneaza si postarile in care apare
*/
async function findHashtagByName(name) {
    try {

        return await Hashtag.findOne({
            where: {name: name},
            include: [
                {
                    model: Post,
                    as: 'posts',
                    attributes: ['id', 'username', 'photoID']
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for hashtag ${name}: ${err}`);
        return null;
    }
}


/*
    functie care cauta un hashtag dupa numele partial
*/
async function findHashtagByPartialName(name) {
    try {
        const { Op } = require('sequelize');

        return await Hashtag.findAll({
            where: {name: {
                [Op.startsWith]: name
              }}
        });

    } catch (err) {
        logError(prefix, `Error while searching for hashtag ${name}: ${err}.`);
        return null;
    }
}

/*
    functie care cauta hashtag-urile asociate postarii
*/
async function findHashtagsByPostID(postID) {
    try {

        return await Hashtag.findAll({
            include: [{
                model: Post,
                as: 'posts',
                attributes: [],
                where: { id: postID }
            }]
        });

    } catch (err) {
        logError(prefix, `Error while searching hashtags for post ID ${postID}: ${err}`);
        return null;
    }
}


/*
    functie care sterge un hashtag
*/
async function deleteHashtag(id) {
    try {
        const result = await Hashtag.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} hashtag(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting hashtag: ${err}.`);
        return false;
    }
}

module.exports = {
    findHashtagByID,
    findHashtagByName,
    findHashtagsByPostID,
    hashtagExists,
    addHashtag,
    findHashtagByPartialName,
    deleteHashtag
};
