const express = require("express");
const router = express.Router();

const {getAllLikes,
       deleteLikeByID,
       createLike} = require('../controller/likeController.js')


router.post('/create/', createLike); 
router.get('/:postID/', getAllLikes);
router.delete('/:postID/', deleteLikeByID);


module.exports = router;
