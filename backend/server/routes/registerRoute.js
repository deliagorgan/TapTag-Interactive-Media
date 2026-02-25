const express = require("express");
const router = express.Router();

const { register, login, logout } = require('../controller/registerController.js');

//router.get('/session', sessionInfo);
router.post('/login', login);
router.get('/logout', logout);
router.post('/register', register);
//router.post('/register/business', registerBusiness);

module.exports = router;
