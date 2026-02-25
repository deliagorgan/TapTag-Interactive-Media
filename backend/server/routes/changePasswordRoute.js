const express = require("express");
const router = express.Router();

const { resetPassword, sendEmail } = require('../controller/changePasswordController.js');


router.post('/send/email', sendEmail);

router.post('/:token(*)', resetPassword);


module.exports = router;
