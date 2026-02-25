const { PaymentHistory, User } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(paymentHistoryOperations.js): ";

/*
    functie care adauga o tranzactie noua
*/
async function addPaymentHistory(payment) {
    try {
        const {userID, amount} = payment;

        /*
            se creaza o noua tranzactie
        */
        const newPayment = await PaymentHistory.create({
            userID,
            amount
        });

        return newPayment;
    } catch (err) {
        logError(prefix, `Error adding new payment transaction: ${err}`);
        return null;
    }
}

/*
    functie care returneaza toate tranzactiile din baza de date
*/
async function getAllPaymentTransactions() {
    try {

        const result = await PaymentHistory.findAll();

        return result;

    } catch (err) {
        logError(prefix, `Error while getting the payment history: ${err}`);
        return null;
    }
}


module.exports = {
    addPaymentHistory,
    getAllPaymentTransactions
};
