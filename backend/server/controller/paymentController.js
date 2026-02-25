const { updateUser, findUserByID, addPaymentHistory } = require('../../database/operations');

const HTTPStatus = require("../constants/HTTPStatus.js");
const { UserRoles } = require('../constants/userRole.js');
const {logError, logSuccess} = require('../utils');

const prefix = "LOG(paymentController.js): ";

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/*
    functie care aproba o tranzactie folosind stripe
*/
async function createPaymentIntent(req, res) {

    try {
        /*
            se extrag campurile din body
        */
        const { amount /* in cents */, userID } = req.body;

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const params = { amount, currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: { userID: String(userID) }
        };

        const paymentIntent = await stripe.paymentIntents.create(params);

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        logError(prefix, `Unable to create payment intent: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care modifica rolul unui utilizator dupa ce acesta a platit taxa
*/
async function paymentConfirmed(req, res) {
    const sig = req.headers["stripe-signature"];
  
    try {
        /*
            se creaza un eveniment
        */
        let event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        /*
            se verifica tipul de raspuns primit de la serverul stripe
        */
        if (event.type !== "payment_intent.succeeded")
            return res.status(HTTPStatus.OK).json({ message: "Mesaj ignorat!" });


        /*
            se extrag campurile din cerere
        */
        const intent = event.data.object;
        const userID = intent.metadata?.userID;
        const amount = intent.amount / 100;

        /*
            se verifica daca exista campul pentru utilizator
        */
        if (!userID)
            return res.status(HTTPStatus.BAD_REQUEST).json({ message: "Nu a fost oferit un userID!" });

        /*
            se verifica daca exista un utilizator cu acest ID
        */
        const user = await findUserByID(userID);

        if (!user)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista un utilizator cu acest userID!" });

        /*
            se aduga tranzactia in istoric
        */
        const payment = await addPaymentHistory({
            userID,
            amount
        });

        if (!payment)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu s-a putut salva tranzactia!" });

        /*
            se modifica rolul utilizatorului
        */
        const result = await updateUser(userID, {role: UserRoles.PREMIUM});

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu a putut fi modificat rolul!" });

        logSuccess(prefix, `PaymentIntent succeeded for user ${userID}, $${amount}`);
  
        return res.status(HTTPStatus.OK).json({ message: "Tranzactia a fost aprobata!" });
    } catch (err) {
        logError(prefix, `Webhook error: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: `Webhook Error: ${err.message}`});
    }

}


module.exports = {createPaymentIntent, paymentConfirmed};
