const express = require("express");
const router = express.Router();

const { getViewsByProfileID } = require('../controller/viewedProfileController.js');


router.get('/user/:userID', getViewsByProfileID); 


module.exports = router;
