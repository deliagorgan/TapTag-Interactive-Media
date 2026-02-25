const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, checkTextForBannedWords, isValid, isURLSafe} = require('../utils');

const prefix = "LOG(checkIntegrityController.js): ";

/*
    functie care verifica daca un text contine cuvinte interzise
*/
async function checkText(req, res) {
    try {
        const text = req.body.text;

        /*
            se verifica daca textul contine cuvinte interzise
        */
        const status = await checkTextForBannedWords(text);

        if (status)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Textul dat contine cuvinte interzise!"});


        return res.status(HTTPStatus.OK).json({message: "Textul este valid!"});
    } catch (err) {
        logError(prefix, `Error while checking the text: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care verifica daca un URL este malitios sau nu, folosing Safe Browsing
*/
async function checkURL(req, res) {
    try {
        const url = req.body.url;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se verifica daca este malitios link-ul
        */
        const status = await isURLSafe(url);

        if (!status)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Link-ul este considerat ca fiind mailitos!"});

        return res.status(HTTPStatus.OK).json({message: "Link-ul nu este malitios!"});
    } catch (err) {
        logError(prefix, `Error while checking the text: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


module.exports = {checkText, checkURL};
