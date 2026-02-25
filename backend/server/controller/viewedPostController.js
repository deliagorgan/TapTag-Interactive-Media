const { getViewsByPostID: getViews, findPostByID } = require('../../database/operations');
const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, isValid} = require('../utils');

const prefix = "LOG(viewedPostController.js): ";


/*
    functie care returneaza toate vizualizarile pentru o anumita postare
*/
async function getViewsByPostID(req, res) {
    try {
        const postID = req.params.postID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });


        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Postarea nu exista!" });

        /*
            doar utilizatorul care a postat postarea poate vizualiza numarul de vizionari
        */
        if (userID != post.author.id)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Doar utilizatorul care a postat postarea poate vedea statisticile!" });

        /*
            se extrag vizualizarile
        */
        const views = await getViews(postID);

        if (!views)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut extrage vizualizarile!"});

        return res.status(HTTPStatus.OK).json(views);
    } catch (err) {
        logError(prefix, `Error while getting likes: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}



module.exports = { getViewsByPostID };
