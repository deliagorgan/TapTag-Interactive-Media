const { registerNormalDataValidation } = require("../access_logic/registerPermissions.js");
const { addUser, 
        findUserByUsername, 
        findUserByID,
        findUserByEmail } = require("../../database/operations");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const HTTPStatus = require("../constants/HTTPStatus.js");
const { logSuccess, 
        logError, isValid } = require("../utils");
const { fromStringToUserRoles } = require('../constants/userRole.js');

const prefix = "LOG(registerController.js): ";
const saltSize = 16;


/*
    functie care verifica daca informatiile utilizatorului
    si genereaza un token
    tokenul se genereaza pe baza JSON-ului cu id-ul userului
    si un string random
    pentru a se putea realiza autentioficarea, trebuie sa fi verificat
    email-ul
*/
async function login(req, res) {
    try {
        const {username, email, password} = req.body;

        /*
            se extrage user-ul din baza de date
        */
        const user = await findUserByUsername(username) || await findUserByEmail(email);

        if (!user)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "There is no user with that username!"});

        /*
            se verifica daca este aceeasi parola si daca si a verificat adresa de email
        */
        if (!(await bcrypt.compare(password, user.password)))
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Wrong password!"});

        if (!user.emailVerified) {
            const {sendEmail} = require("../utils");
            const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
            const result = await sendEmail(user.id, user.email, 1, origin);

            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "The email address couldn't be verified! A new email has been sent!"});
        }

        const salt = crypto.randomBytes(saltSize).toString('hex');

        const token = jwt.sign({id: user.id, salt: salt}, process.env.JWT_SECRET,  { expiresIn: process.env.JWT_EXPIRATION });

        /*
            se salveaza token-ul in baza de date
        */
        user.token = token;
        await user.save();

        return res.status(HTTPStatus.OK).json({
            username: user.username,
            ID: user.id,
            token,
            role: user.role
        });
    } catch (err) {
        logError(prefix, err);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la logare!"});
    }
    
}

async function logout(req, res) {
    try {
        /*
            se verifica daca token-ul exista si este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token invalid!"});

        /*
            se afla user-ul cu acel token
        */
        const user = await findUserByID(currentUserID);

        if (!user)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Utilizatorul nu exista!"});

        // se sterge token-ul din baza de date
        user.token = null;
        user.save();

        return res.status(HTTPStatus.OK).json({message: "Delogare cu succes!"});
    } catch (err) {
        logError(prefix, err);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la delogare!"});
    }   
}

async function register(req, res) {
    try {
        const {username, firstName, lastName, email, password, role, DOB, gender} = req.body;

        /*
            se verifica daca datele sunt valide
        */
        const {status, message} = await registerNormalDataValidation(req.body);
        if(status === false)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: message});

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.HASH_NUMBER, 10));

        const roleObject = fromStringToUserRoles(role);

        if (!roleObject)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Rolul utilizatorului este invalid!"});


        const result = await addUser({
            username, 
            firstName, 
            lastName, 
            email, 
            password: hashedPassword, 
            role: roleObject, 
            description: "", 
            profilePhotoID: null,
            gender,
            DOB
        });

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la inregistrare!"});


        /* 
            se trimite un email catre adresa de email oferita pentru a fi validata
        */
        const {sendEmail} = require("../utils");
        const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
        const emailResult = await sendEmail(result.id, email, 1, origin);

        if (!emailResult)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu a putut fi trimis email-ul de verificare!"});


        logSuccess(prefix, `Userul ${username} a fost inregistrat cu succes.`);

        return res.status(HTTPStatus.OK).json({message: "Inregistrare cu succes!", userID: result.id});
    } catch (err) {
        logError(prefix, `Eroare la crearea unui utilizator: ${err}.`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la inregistrare!"});
    }
}


module.exports = {login,
                  logout,
                  register};
