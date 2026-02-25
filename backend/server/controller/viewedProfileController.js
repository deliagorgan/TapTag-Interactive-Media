const { getViewsByProfileID: getViews, findUserByID } = require('../../database/operations');
const HTTPStatus = require("../constants/HTTPStatus.js");
const {logError, logSuccess, isValid} = require('../utils');

const prefix = "LOG(viewedProfileController.js): ";


/*
    functie care returneaza toate vizualizarile pentru un anumit profil
*/
async function getViewsByProfileID(req, res) {
    try {
        const userID = req.params.userID;

        /*
            se extrage token-ul din header si se verifica daca este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });


        /*
            se verifica daca postarea exista
        */
        const user = await findUserByID(userID);

        if (!user)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Utilizatorul nu exista!" });

        /*
            doar utilizatorul care detine contul poate vizualiza numarul de vizionari
        */
        if (userID != currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Doar utilizatorul care a detine contul poate vedea statisticile!" });

        /*
            se extrag vizualizarile
        */
        const views = await getViews(userID);

        if (!views)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut extrage vizualizarile!"});

        return res.status(HTTPStatus.OK).json(views);
    } catch (err) {
        logError(prefix, `Error while getting profile views: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}



module.exports = { getViewsByProfileID };
