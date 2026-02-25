const sequelize = require('../db.js');
const { Image } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(imageOperations.js): ";

/*
    functie care adauga o imagine
*/
async function addImage(image) {
    try {

        const result = await Image.create({
            imagePath: image.imagePath
        });

        if (!result)
            return null;

        logSuccess(prefix, `Imaginea a fost adaugata in baza de date.`);

        return result;
    } catch (err) {
        logError(prefix, `Error adding image: ${err}.`);
        return null;
    }
}

/*
    functie care returneaza toate imaginile din baza de date
    folosita pentru incarcarea modelului
*/
async function getAllImages() {
    try {

        return await Image.findAll();

    } catch (err) {
        logError(prefix, `Error while searching for all images: ${err}`);
        return null;
    }
}



/*
    functie care returneaza o imagine dupa id
*/
async function findImageByID(id) {
    try {

        return await Image.findByPk(id);

    } catch (err) {
        logError(prefix, `Error while searching for image ${id}: ${err}`);
        return null;
    }
}

/*
    functie care returneaza toate imaginile cu un anumit userID
*/
async function findImageByUserID(userID) {
    try {
        return await Image.findAll({
            where: {userID: userID}
        });

    } catch (err) {
        logError(prefix, `Error while searching for image ${id}: ${err}`);
        return null;
    }
}


/*
    functie care sterge o imagine si din cloud
*/
async function deleteImage(id) {
    try {
        const image  = await findImageByID(id);

        /*
            se stergea imaginea din baza de date
        */
        result = await Image.destroy({ where: { id } });
        logSuccess(prefix, `Deleted ${result} image(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting image: ${err}.`);
        return false;
    }
}

module.exports = {
    findImageByID,
    addImage,
    getAllImages,
    findImageByUserID,
    deleteImage
};
