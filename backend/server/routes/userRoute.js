const express = require("express");
const router = express.Router();

const {getAllUserInfo,
    getUserInfoByID,
    getUserPublicInfoByID,
    getUserIDByUsername,
    getUsersPublicInfoByPartialUsername,
    updateUserInfoByID,
    getAllNonAdminUserInfo,
    addAdminUser,
    deleteUserByID} = require('../controller/userController.js')


router.post('/addAdmin', addAdminUser);

router.get('/profile/preview/partial_username/:username', getUsersPublicInfoByPartialUsername);

router.get('/profile/preview/:id', getUserPublicInfoByID);

router.get('/profile/:id', getUserInfoByID);

router.get('/id/username/:username', getUserIDByUsername);

router.get('/', getAllUserInfo);
router.get('/nonAdmin/', getAllNonAdminUserInfo);


router.post('/profile/delete/:id', deleteUserByID);


router.put('/profile/:id', updateUserInfoByID);


module.exports = router;
