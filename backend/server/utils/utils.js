const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prefix = "LOG(utils.js): ";

/*
    functie care verifica daca un token primit de la frontend
    este valid
    returneaza userID-ul care este retinut in token
    verifica si daca token-ul este in baza de date
*/
async function isValid(req, extraCheck=true) {
    const { logError } = require("./logConsole");
    const { findUserByID } = require("../../database/operations");
    /*
        se verifica daca token-ul exista
    */

    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice(7);

    try {
        const {id} = jwt.verify(token, process.env.JWT_SECRET);

        const userID = id;

        /*
            se verifica daca exista un utilizatorul cu acel ID
        */
        const user = await findUserByID(userID);


        if (!user)
            return null;

        /*
            se verifica daca pentru utilizatorul respectiv se afla in baza de date
            token-ul primit

            aceasta verificare se face doar daca este necesar, deoarece aceasta functie
            este folosita si pentru validarea adresei de email, adica a tokenului generat
            de backend, iar pt acesta nu exista nimic salvat in baza de date 
        */
        if (extraCheck) {
            if (user.token === token)
                return userID;
            else
                return null;
        } else {
            return userID;
        }

    } catch (err) {
        logError(prefix, `Error while validatating token: ${err}`);
        return null;
    }
}

/*
    functie care transforma dintr-un vector de nume pentru hashtag-uri
    intr-un vector de hashtagID-uri

    daca nu exista un hashtag, atunci il creaza
*/
async function transformHashtags(hashtagNames) {
    const { hashtagExists, addHashtag } = require('../../database/operations');

    let data = [];

    /*
        se verifica daca hashtag-urile exista daca nu le creeaza
    */
    for (let hashtag of hashtagNames) {
        let result = await hashtagExists(hashtag.name);

        if (!result) {
            result = await addHashtag({name: hashtag.name});

            if (!result)
                return null;
        }

        data.push(result.id);
    }

    return data;
}


async function sendPostNotificationToAllFollowers(currentUserID, postID) {
    const { addPostNotification, findFollowersByID, findUserByID } = require('../../database/operations');
    const { sendNotificationToUser } = require('./socketOperations');
    const { logError } = require("./logConsole");

    try {
        /*
            se primesc toti utilizatorii care il urmaresc pe utilizatorul care a postat imaginea
        */
        const followers = await findFollowersByID(currentUserID);

        if (!followers)
            return null;

        const user = await findUserByID(currentUserID);

        /*
            pentru fiecare utilizator este creata o notificare
        */
        for (const follower of followers) {
            const result = await addPostNotification({
                postID: postID,
                recipientID: follower.followerUser.id
            });

            if (!result)
                return null;

            /*
                se trimite notificarea prin socket catre frontend
            */
    
            sendNotificationToUser(follower.followerUser.id, {
                type: 'post',
                notificationID: result.id,
                postID: postID,
                fromUserID: currentUserID,
                username: user.username,
                createdAt: result.createdAt
            });
        }

        return true;

    } catch (err) {
        logError(prefix, `Error while sending post notifications: ${err}`);
        return null;
    }
}


/*
    functie care creaza utilizatorul admin principal daca nu exista deja
*/
async function createMainAdminUser() {
    const { addUser, findUserByUsername, updateUser } = require('../../database/operations');
    const { logError, logSuccess } = require("./logConsole");
    const { UserRoles } = require('../constants/userRole');

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    try {
        /*
            se verifica daca exista deja in sistem utilizatorul cu username 'admin'
        */
        let user = await findUserByUsername(username);

        if (user)
            return;

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.HASH_NUMBER, 10));

        /*
            daca nu exista deja se creaza
        */
        user = await addUser({
            username: username,
            firstName: 'Admin',
            lastName: 'Admin',
            email: 'noreply.taptag@gmail.com',
            password: hashedPassword,
            profilePhotoID: null,
            role: UserRoles.ADMIN,
            description: 'Main administrator account',
            DOB: new Date('1970-01-01'),
            gender: 'OTHER'
        });

        if (!user)
            logError(prefix, `Nu s-a putut crea utilizatorul admin!`);
        
        /*
            se seteaza adresa de email ca fiind verificata
        */
        await updateUser(user.id, {emailVerified: 1});

        logSuccess(prefix, `Utilizatorul administrator principal a fost creat!`);
    } catch(err) {
        logError(prefix, `Nu s-a putut adauga utilizatorul admin principal: ${err}`);
    }
}

/*
    functie care sterge toate token-urile din sistem
    are efectul ca tot utiliatorii au fost delogati
*/
async function deleteAllTokens() {
    const { logError, logSuccess } = require("./logConsole");
    const { User } = require('../../database/models');

    try {

        await User.update(
            { token: null },
            { where: {} }
        );

        logSuccess(prefix, `Toate token-urile au fost sterse cu succes!`);
    } catch(err) {
        logError(prefix, `Nu s-au putut sterge toate token-urile din baza de date: ${err}`);
    }
}


module.exports = { isValid,
                   transformHashtags,
                   sendPostNotificationToAllFollowers,
                   createMainAdminUser,
                   deleteAllTokens };
