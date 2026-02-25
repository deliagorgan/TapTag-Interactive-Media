const express = require("express");
const router = express.Router();

const { checkEmail } = require('../controller/emailVerificationController.js');

// se pune * pentru a selecta tot ce e dupa 'email/'
// pot aparea spatii in token
router.get('/:token(*)', checkEmail); 


module.exports = router;
