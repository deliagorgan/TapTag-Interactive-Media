const { findUserByUsername } = require("../../database/operations/userOperations.js");
const { logError } = require("../utils/logConsole.js");

const prefix = "LOG(registerPermissions.js): ";

/*
    functie care verifica daca email-ul are o structura valida
*/
async function emailValidation(email) {
    try {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(email);
    } catch(err) {
        logError(prefix, `Eroare la validarea email-ului: ${err}.`);
        return false;
    }
}


/*
    functie care verifica daca parola indeplineste criteriile dorite
    are intre 8 si 20 de caractere
*/
async function passwordValidation(password) {
    try {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

        return passwordRegex.test(password);
    } catch (err) {
        logError(prefix, `Eroare la validarea parolei: ${err}.`);
        return false;
    }
}


/*
    functie care verifica integritatea datelor pentru crearea unui
    utilizator Normal sau Premium
*/
async function registerNormalDataValidation(data) {
    try {
        const {username, firstName, lastName, email, password, role, DOB} = data;

        /*
            se veridica daca toate campurile primite sunt valide
        */
        let result = await emailValidation(email);
        if (!result)
            return {status: false, message: "Email-ul nu este unul valid."};

        result = await passwordValidation(password);
        if (!result)
            return {status: false, message: "Parola trebuie sa contina minim 8 caractere si litere mici si mari."};

        result = await findUserByUsername(username);
        if (result)
            return {status: false, message: "Username-ul este folosit de alt utilizator."};

        if (/[0-9!@#$%^&*()_+=`~]/.test(firstName) || firstName.length < 2)
            return {status: false, message: "Prenumele nu este valid."};

        if (/[0-9!@#$%^&*()_+=`~]/.test(lastName) || lastName.length < 2)
            return {status: false, message: "Numele de familie nu este valid."};

        if (role === 'Business' || role === 'Admin')
            return {status: false, message: "Nu ati selectat un rol valid."};

        if (!DOB || isNaN(Date.parse(DOB)))
            return {status: false, message: "Data de nastere nu este corecta."};


        return {status: true, message: "Succes."};

    } catch (err) {
        logError(prefix, `Eroare la inregistrarea userului: ${err}.`);
        return {status: false, message: err};
    }
}

module.exports = {registerNormalDataValidation};
