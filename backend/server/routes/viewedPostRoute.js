const express = require("express");
const router = express.Router();

const { getViewsByPostID } = require('../controller/viewedPostController.js');


router.get('/post/:postID', getViewsByPostID);


module.exports = router;
