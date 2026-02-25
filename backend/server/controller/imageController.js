const HTTPStatus = require("../constants/HTTPStatus.js");
const { downloadImageFromCloud,
        findImageByID,
        deleteImage: deleteImageByID,
        deleteImageFromCloud,
        addImageInCloud,
        addImage } = require('../../database/operations');
const { logError, insertAndCheckData, extractData, isValid } = require('../utils');
const NodeCache = require("node-cache");

/*
    o intrare este salvata in cache pentru 10 minute
*/
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

const prefix = "LOG(imageController.js): ";

/*
    functie care returneaza imaginea cu id-ul dat
*/
async function getImageByID(req, res) { 
    try {
        const imageID = req.params.imageID;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se verifica daca imaginea exista
        */
        const image = await findImageByID(imageID);

        if (!image)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Imaginea nu exista!"});

        /*
            se verifica daca imaginea este salvata in cache
        */
        const cache_entry = cache.get(imageID);

        if (cache_entry)
            return res.status(HTTPStatus.OK).json({data: cache_entry.data, metadata: cache_entry.metadata});


        /*
            altfel se downloadeaza imaginea de pe cloud
        */
        const data = await downloadImageFromCloud(image.imagePath);

        if (!data)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Imaginea nu exista in cloud"});

        /*
            se extrag metadatele din imagine folosind serverul python
        */
        const metadata = await extractData(data);

        /*
            se adauga in cache imaginea si metadatele
        */
        cache.set(imageID, {data, metadata});

        return res.status(HTTPStatus.OK).json({ data, metadata });

    } catch (err) {
        logError(prefix, `Eroare la returnearea postarilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care creaza o imagine pe baza datelor primite in format base64
    se primeste token ul in header, iar imaginea in body
*/
async function createImage(req, res) {
    try {
        const {data, metadata} = req.body;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se adauga metadatele in imagine folosind serverul python
        */
        const newData = await insertAndCheckData(data, metadata);

        if (!newData)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut adauga metadatele in imagine/Imaginea nu este unica."});

        /*
            se adauga in cloud imaginea
        */
        const url = await addImageInCloud(newData);

        if (!url)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut adauga imaginea in cloud."});

        /*
            se adauga url-ul in baza de date
        */
        result = await addImage({imagePath: url});

        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu s-a putut adauga imaginea!"});

        return res.status(HTTPStatus.OK).json({photoID: result.id});

    } catch (err) {
        logError(prefix, `Eroare la adaugarea imaginii: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care sterge o imagine din baza de date
    OBS: acesta functie trebuie apelata neaparat inainte de stergerea unei postari/user
*/
async function deleteImage(req, res) {
    try {
        const imageID = req.params.imageID;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se cauta imaginea cu ID-ul dat
        */
        const image = await findImageByID(imageID);

        if (!image)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Imaginea nu exista!"});

        /*
            se sterge din cloud imaginea
        */
        let result = await deleteImageFromCloud(image.imagePath);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut sterge imaginea din cloud."});


        /*
            se sterge intrarea din baza de date
        */
        result = await deleteImageByID(imageID);

        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu s-a putut sterge imaginea!"});

        return res.status(HTTPStatus.OK).json({message: `Imaginea a fost stearsa cu succes.`});

    } catch (err) {
        logError(prefix, `Eroare la stergerea imaginii: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

module.exports = {
    getImageByID,
    createImage,
    deleteImage
};