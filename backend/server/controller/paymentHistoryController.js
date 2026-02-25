const { findUserByID, getAllPaymentTransactions } = require('../../database/operations');

const HTTPStatus = require("../constants/HTTPStatus.js");
const { UserRoles } = require('../constants/userRole.js');
const {logError, logSuccess, isValid} = require('../utils');

const prefix = "LOG(paymentHistoryController.js): ";


/*
    functie care returneaza toate tranzactiile din baza de date
*/
async function getPaymentHistory(req, res) {
    try {
        /*
            se verifica daca token-ul exista si este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });


        /*
            se verifica daca utilizatorul este admin
        */
        const currentUser = await findUserByID(currentUserID);

        if (currentUser.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu esti utilizator admin!" });


        /*
            se returneaza toate tranzactiile
        */
        const transactions = await getAllPaymentTransactions();

        return res.status(HTTPStatus.OK).json(transactions);
    } catch (err) {
        logError(prefix, `Error while getting all the payment transactions: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


module.exports = {getPaymentHistory};
