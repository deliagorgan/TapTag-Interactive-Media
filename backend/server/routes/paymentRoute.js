const express = require("express");
const router = express.Router();

const { createPaymentIntent, paymentConfirmed } = require('../controller/paymentController.js');

router.post('/create-payment-intent/', createPaymentIntent);

router.post('/confirm/', paymentConfirmed); 

module.exports = router;
