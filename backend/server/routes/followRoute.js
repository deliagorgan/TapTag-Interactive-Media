const express = require("express");
const router = express.Router();

const { deleteFollower,
        deleteFollowing,
        addFollower, 
        getFollowers,
        getFollowing } = require('../controller/followController.js');


router.post('/', addFollower);
router.delete('/following/:userID', deleteFollowing);
router.get('/following/:userID/', getFollowing);
router.get('/followers/:userID/', getFollowers);
router.delete('/:userID', deleteFollower);

module.exports = router;
