const { updateUser, findUserByEmail } = require('../../database/operations');
const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, isValid} = require('../utils');
const bcrypt = require('bcrypt');

const prefix = "LOG(changePasswordController.js): ";


/*
    functie care verifica token-ul primit si daca este valid
    modifica parola
*/
async function resetPassword(req, res) {
    try {
        const token = req.params.token;
        const newPassword = req.body.password;

        /*
            se verifica daca token-ul primit pe mail este valid
        */
        let myReq = { headers: {authorization: null} };
        myReq.headers.authorization = `Bearer ${token}`;

        // se foloseste false pentru a nu cauta daca token-ul se afla in baza de date
        const currentUserID = await isValid(myReq, false);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se hashuieste noua parola
        */
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.HASH_NUMBER, 10));

        /*
            se modifica parola
        */
        const result = await updateUser(currentUserID, {password: hashedPassword});

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut modifica parola!"});
        
        return res.status(HTTPStatus.OK).json({message: "Parola a fost schimbata cu succes!"});
    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care trimite un mail catre adresa primita
    pentru a se reseta parola
*/
async function sendEmail(req, res) {
    try {
        const email = req.body.email;

        /*
            se cauta user-ul care are acel email
        */
        const user = await findUserByEmail(email);

        if (!user)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista un cont cu aceasta adreasa de email!" });

        /*
            se extrage adresa IP a clientului
        */
        const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;

        /*
            se trimite un email la adresa primita
        */
        const {sendEmail: sendEmailAux} = require("../utils");

        // se alege modul pentru resetare de parola
        const result = await sendEmailAux(user.id, user.email, 2, origin);

        if (!result)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Nu a putut fi trimis un email la adresa data!"});

        return res.status(HTTPStatus.OK).json({message: "Email-ul a fost trimis cu succes!"});

    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


module.exports = { resetPassword, sendEmail };
