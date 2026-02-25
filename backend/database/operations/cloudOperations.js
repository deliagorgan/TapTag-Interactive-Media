const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(cloudOperations.js): ";

const crypto = require('crypto');

const generateFileName = () => {
    return crypto.randomBytes(16).toString("hex"); // 16 bytes -> 32 caractere hexazecimale
  };

/*
    functie care adauga o imagine in cloud
    primeste imaginea codificata in base64
    returneaza URL-ul pozei din cloud
*/
async function addImageInCloud(imageRawData) {
    try {    
        const fileName = generateFileName();
    
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${imageRawData}`, {
            resource_type: 'image',
            public_id: fileName,
        });

        logSuccess(prefix, `Imaginea a fost adaugata in cloud la adresa: ${result.secure_url}.`);

        return result.secure_url;
    } catch(err) {
        logError(prefix, `Eroare la adaugarea imaginii: ${JSON.stringify(err.error.code)}`);

        return null;
    }
}


/*
    functie care downloadeaza o imagine pe baza URL-ului
    returneaza imaginea codificata in base64
*/
async function downloadImageFromCloud(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');

        return base64;
    } catch (err) {
        logError(prefix, `Error downloading image: ${err}`);
        return null;
    }
}


/*
    functie care sterge un o imagine din cloud pe baza url-ului
*/
async function deleteImageFromCloud(url) {
    try {
        const publicId = url.split('/').pop().split('.')[0];

        const result = await cloudinary.uploader.destroy(publicId);

        if (!result) {
            logError(prefix, `Cannot delete image from cloud.`);
            return false;
        }

        logSuccess(prefix, `Deleted an image from cloud.`);
        return true;
    } catch (err) {
        logError(prefix, `Error deleting image from cloud: ${err}`);
        return false;
    }
}

module.exports = {
    addImageInCloud,
    downloadImageFromCloud,
    deleteImageFromCloud
};
