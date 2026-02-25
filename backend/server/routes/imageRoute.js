const express = require("express");
const router = express.Router();

const { getImageByID,
        deleteImage,
        createImage } = require('../controller/imageController.js');


router.post('/create', createImage);
router.get('/:imageID', getImageByID);
router.delete('/:imageID', deleteImage);

module.exports = router;
