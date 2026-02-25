const HTTPStatus = require("../constants/HTTPStatus.js");
const { findHashtagByName,
        deleteHashtag: deleteHashtagByID,
        findHashtagsByPostID,
        findHashtagByPartialName: findHastagsByName,
        deletePost,
        findUserByID} = require('../../database/operations');
const { logError, logSuccess, isValid } = require('../utils');
const { UserRoles } = require('../constants/userRole.js');

const prefix = "LOG(hashtagController): ";

/*
    functie care sterge un hashtag si toate postarile care il au
    doar utilizatorul admin poate face
*/
async function deleteHashtag(req, res) {
    try {
        const name = req.body.name;
        let result = null;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se verifica daca user-ul este admin
        */
        const currentUser = await findUserByID(currentUserID);

        if (currentUser.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu poti sterge hashtag-ul."});

        /*
            se extrage hashtag-ul si toate postarile
        */
        const hashtag = await findHashtagByName(name);

        if (!hashtag)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: `Nu s-a putut gasi hashtag-ul cu numele ${name}.` });

        /*
            se sterg toate postarile
            OBS: aceasta operatie poate fi paralelizata folosind "Promise.all"
        */
        for (let post of hashtag.posts) {
            /*
                se sterge poza din cloud
            */
            const image = await findImageByID(post.photoID);

            if (!image)
                return res.status(HTTPStatus.NOT_FOUND).json({message: "Imaginea nu exista in cloud."});

            let result = await deleteImageFromCloud(image.url);

            if (!result)
                return res.status(HTTPStatus.NOT_FOUND).json({message: "Nu s-a putut sterge imaginea din cloud."});

            /*
                se sterge postarea
            */
            result = await deletePost(post.id);

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: `Nu s-a putut sterge postarea cu id-ul ${post.id}.` });
        }

        /*
            se sterge hashtag-ul
        */
        result = await deleteHashtagByID(hashtag.id);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: `Nu s-a putut sterge hashtag-ul cu id-ul ${hashtag.id}.` });

        logSuccess(prefix, `Hashtag-ul a fost sters cu succes.`);
        return res.status(HTTPStatus.OK).json({message: "Hashtag-ul a fost sters."});

    } catch(err) {
        logError(prefix, `Eroare la stergerea hashtag-ului: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza toate hashtagurile asociate unei anumite postari
*/
async function findHastagsByPostID(req, res) {
    try {
        const postID = req.params.postID;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        
        /*
            se extrag hashtag-urile din baza de date
        */
        const hashtags = await findHashtagsByPostID(postID);

        if (!hashtags)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Nu s-au putut extrage hashtag-urile." });

        return res.status(HTTPStatus.OK).json(hashtags);

    } catch(err) {
        logError(prefix, `Eroare la cautarea hashtag-urilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}



/*
    functie care returneaza toate hashtag-urile care au un anumit nume partial
*/
async function findHastagsByPartialName(req, res) {
    try {
        const name = req.params.name;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        
        /*
            se extrag hashtag-urile din baza de date
        */
        const hashtags = await findHastagsByName(name);

        if (!hashtags)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Nu s-au putut extrage hashtag-urile." });

        return res.status(HTTPStatus.OK).json(hashtags);

    } catch(err) {
        logError(prefix, `Eroare la cautarea hashtag-urilor cu numele partial ${name}: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


module.exports = {
    deleteHashtag,
    findHastagsByPostID,
    findHastagsByPartialName,
};