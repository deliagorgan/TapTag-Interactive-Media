const express = require("express");
const router = express.Router();

const { getRegionViewsByPostID,
        addRegionViewsByPostID } = require('../controller/viewedRegionController.js');


router.get('/post/:postID', getRegionViewsByPostID); 
router.post('/', addRegionViewsByPostID);


module.exports = router;
