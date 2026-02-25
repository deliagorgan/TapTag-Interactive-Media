const express = require("express");
const router = express.Router();

const { checkText, checkURL } = require('../controller/checkIntegrityController.js');


router.post('/text/', checkText);
router.post('/url/', checkURL);


module.exports = router;
