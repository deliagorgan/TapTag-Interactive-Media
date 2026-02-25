const express = require("express");
const router = express.Router();

const { deleteHashtag,
    findHastagsByPartialName,
    findHastagsByPostID } = require('../controller/hashtagController.js');


router.delete('/', deleteHashtag);
router.get('/:postID', findHastagsByPostID);

router.get('/partial_name/:name', findHastagsByPartialName);

module.exports = router;
