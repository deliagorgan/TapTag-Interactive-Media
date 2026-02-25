
const { updateUser } = require('../../database/operations');

const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, isValid} = require('../utils');

const prefix = "LOG(emailVerificationController.js): ";

/*
    functie care verifica adresa de email
*/
async function checkEmail(req, res) {

    try {
        /*
            se verifica daca token-ul primit din email exista si este valid
        */
        const token = req.params.token;

        let myReq = { headers: {authorization: null} };
        myReq.headers.authorization = `Bearer ${token}`;

        const currentUserID = await isValid(myReq, false);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se seteaza ca email-ul a fost verificat 
        */
        const result = await updateUser(currentUserID, { emailVerified: 1 } );

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la validarea adresei de email."});
        
        return res.status(HTTPStatus.OK).json({ message: "Adresa de email a fost validata!" });
    } catch (err) {
        logError(prefix, `Error while validating email address: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}




module.exports = {checkEmail};
