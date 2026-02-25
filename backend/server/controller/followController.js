const HTTPStatus = require("../constants/HTTPStatus.js");
const { addFollower: addFollowerByID, // se redenumeste functia pt a evita conflictul de nume
        deleteFollower: deleteFollowerByID,
        findFollowersByID,
        addFollowNotification,
        findUserByID,
        followExists,
        findFollowingByID } = require('../../database/operations/index.js');
const { isValid } = require('../utils/utils.js');
const { logError, logSuccess } = require('../utils/index.js');
const { sendNotificationToUser } = require('../utils/socketOperations');

const prefix = "LOG(followController.js): ";



/*
    functie care adauga un follower pentru utilizatorul
    care a facut cererea
*/
async function addFollower(req, res) {
    try {
        const id = req.body.userID;
        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se verifica daca este acelasi ID
        */
        if (currentUserID == id)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu te poti urmari pe tine!"});

        /*
            se verifica sa nu se urmareasca de 2 ori
        */
        let result = await followExists(currentUserID, id);

        if (result.length > 0)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Follow-ul exista deja." });

        /*
            se adauga in baza de date
        */
        const follow = await addFollowerByID({ userID: currentUserID,
                                         followedUserID: id });

        if (!follow)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "User-ul pe care vrei sa l urmaresti nu exista." });


        /*
            se trimite notificare catre persoana care este urmarita
        */
        result = await addFollowNotification({
            followID: follow.id,
            recipientID: follow.followedUserID
        });

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut crea notificarea pt like-ul dat!"});

        /*
            se trimite in timp real catre frontend
        */
        const user = await findUserByID(currentUserID);
        
        sendNotificationToUser(follow.followedUserID, {
            type: 'follow',
            notificationID: result.id,
            fromUserID: currentUserID,
            username: user.username,
            createdAt: result.createdAt
        });

        return res.status(HTTPStatus.OK).json({ message: "Follow inregistrat cu succes." });

    } catch(err) {
        logError(prefix, `Eroare la urmarirea user-ului ${err}.`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Eroare la adaugarea follower-ului." });
    }
}




/*
    functie care sterge un follower pt utilizatorul
    logat
*/
async function deleteFollower(req, res) {
    try {
        const userID = req.params.userID;
        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se sterge relatia de follow
        */
        const result = await deleteFollowerByID(currentUserID, userID);
        
        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu s-a putut sterge follower-ul"});

        return res.status(HTTPStatus.OK).json({ message: "Follow sters cu succes." });

    } catch(err) {
        logError(prefix, `Eroare la stergerea follow-ului ${err}.`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Eroare la stergerea follower-ului." });
    }
}


/*
    functie care sterge un following pt utilizatorul
    logat
*/
async function deleteFollowing(req, res) {
    try {
        const userID = req.params.userID;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

       /*
            se sterge relatia de follow
        */
        const result = await deleteFollowerByID(userID, currentUserID);
    
        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu s-a putut sterge following-ul"});

    

        return res.status(HTTPStatus.OK).json({ message: "Follow sters cu succes." });

    } catch(err) {
        logError(prefix, `Eroare la stergerea follow-ului ${err}.`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Eroare la stergerea follower-ului." });
    }
}



/*
    functie care returneaza toti userii care il urmaresc pe
    user-ul cu ID-ul din ruta
*/
async function getFollowers(req, res) {
    try {
        const userID = req.params.userID;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se cauta toti userii
        */
        const followers = await findFollowersByID(userID);

        return res.status(HTTPStatus.OK).json(followers);

    } catch(err) {
        logError(prefix, `Eroare la urmarirea user-ului ${err}.`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Eroare la adaugarea follower-ului." });
    }
}



/*
    functie care returneaza userii pe care ii urmareste utilizatorul cu ID-ul din
    ruta
*/
async function getFollowing(req, res) {
    try {
        const userID = req.params.userID;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});


        /*
            se cauta toti userii
        */
        const following = await findFollowingByID(userID);

        return res.status(HTTPStatus.OK).json(following);

    } catch(err) {
        logError(prefix, `Eroare la returnarea following-urilor ${err}.`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Eroare la returnearea followerilor." });
    }
}



module.exports = {
    deleteFollower,
    deleteFollowing,
    addFollower, 
    getFollowers,
    getFollowing
};
