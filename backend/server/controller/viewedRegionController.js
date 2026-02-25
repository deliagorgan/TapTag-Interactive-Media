const { getRegionViewsByPostID: getViews, findPostByID, findUserByID, addViewedRegion } = require('../../database/operations');
const HTTPStatus = require("../constants/HTTPStatus.js");
const { UserRoles } = require('../constants/userRole.js');
const {logError, logSuccess, isValid} = require('../utils');

const prefix = "LOG(viewedRegionController.js): ";


/*
    functie care adauga o vizualizare pentru o regiune de la o postare
*/
async function addRegionViewsByPostID(req, res) {
    try {
        const {postID, type} = req.body;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        const user = await findUserByID(currentUserID);


        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Postarea nu exista!" });

        /*
            doar pt utilizatorii care nu sunt admini si care nu detin postarea, se adauga o vizualizare
        */
        if (post.userID === currentUserID || user.role === UserRoles.ADMIN)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Doar pt utilizatorii care nu sunt admini si care nu detin postarea, se poate adauga o vizualizare!" });

        /*
            se extrag vizualizarile
        */
        const view = await addViewedRegion({userID: currentUserID, postID, type});

        if (!view)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut adauga vizualizarea!"});

        return res.status(HTTPStatus.OK).json(view);
    } catch (err) {
        logError(prefix, `Error while adding a region view: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza toate vizualizarile regiunilor pentru o anumita postare
*/
async function getRegionViewsByPostID(req, res) {
    try {
        const postID = req.params.postID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });


        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Postarea nu exista!" });

        /*
            doar utilizatorul care detine contul poate vizualiza numarul de vizionari
        */
        if (post.userID != currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Doar utilizatorul care a detine contul poate vedea statisticile!" });

        /*
            se extrag vizualizarile
        */
        const views = await getViews(postID);

        if (!views)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut extrage vizualizarile!"});

        return res.status(HTTPStatus.OK).json(views);
    } catch (err) {
        logError(prefix, `Error while getting region views: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}



module.exports = { 
    getRegionViewsByPostID,
    addRegionViewsByPostID
};
