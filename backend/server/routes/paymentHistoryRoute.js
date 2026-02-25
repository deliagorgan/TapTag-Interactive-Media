const express = require("express");
const router = express.Router();

const { getPaymentHistory } = require('../controller/paymentHistoryController.js');

router.get('/', getPaymentHistory);

module.exports = router;
