
/*
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const AnnoyIndex = require('annoy');

const prefix = "LOG(imageManipulation.js): ";


let model = null;
let loadedAnnoyIndex = false;
const embeddingDimension = 1024; // MobileNet v2 produces 1024-dimension embeddings
const annoyIndex = new AnnoyIndex(embeddingDimension, 'angular');


/*
    functie care incarca modelul
*/
async function loadModel() {
    model = await mobilenet.load();
    const {logSuccess} = require('./logConsole.js');
    logSuccess(prefix, "Modelul a fost incarcat cu succes.");
}

// Decode base64 image and convert to tensor
function decodeBase64Image(base64String) {
    const buffer = Buffer.from(base64String, 'base64');
    return tf.node.decodeImage(buffer);
}

// Compute the embedding for an image (from base64 string)
async function computeImageEmbedding(base64String) {
    if (!model) {
        await loadModel();
        console.log("trece boss");
    }

    // Decode the base64 image and convert it to tensor
    const imageTensor = decodeBase64Image(base64String);

    // Get the embedding (feature vector) from the image
    const embedding = await model.infer(imageTensor, 'conv_preds');
    return embedding;
}


/*
    functie care converteste din imaginea codificata in base64 in
    array-ul procesat
*/
async function convertImageToEmbeddedArray(base64String) {
    try {
        const embedding = await computeImageEmbedding(base64String);
        return embedding.arraySync();
    } catch (err) {
        const {logError} = require('./logConsole.js');
        logError(prefix, `Eroare la convertirea din imagine in embedded array: ${err}.`);
        return null;
    }
}
  

/*
    functie care incarca informatiile despre toate imaginile din baza de date
*/
async function loadAnnoyIndex() {
    if (loadedAnnoyIndex)
        return ;

    try {
        const {getAllImages} = require('../../database/operations');

        /*
            se incarca toate imaginile din baza de date
        */
        const images = await getAllImages();
    
        for (const image of images) {
            annoyIndex.addItem(image.id, image.embedding);
        }
    
        loadedAnnoyIndex = true;
    } catch (err) {
        const {logError} = require('./logConsole.js');
        logError(prefix, `Eroare la incarcarea imaginilor din baza de date: ${err}.`);
    }

}

/*
    functie care returnerneaza daca imaginea este destul de
    diferita fata de celelalte sau nu
*/
async function searchForSimilarImage(newBase64Image) {
    try {
        const {logSuccess} = require('./logConsole.js');

        await loadAnnoyIndex();

        const newImageEmbedding = await computeImageEmbedding(newBase64Image);
    
        const nearestNeighborsCount = parseInt(process.env.IMAGE_NEAREST_NEIGHBORS, 10);
        const treshold = parseInt(process.env.IMAGE_SIMILARITY_TRESHOLD, 10);
    
        // Search for the nearest neighbors (get index and distances)
        const nearestNeighbors = annoyIndex.getNNsByVector(newImageEmbedding.arraySync(), 
        nearestNeighborsCount, 
                                            -1, true);
    
        if (nearestNeighbors.length > 0) {
            const [_, distance] = nearestNeighbors[0];
            const similarity = 1 - distance; // Convert angular distance to similarity score
    
            if (similarity >= treshold) {
                return false;
            } else {
                logSuccess(prefix, "Imaginea este diferita.");
                return true;
    
    
            }
        } else {
            logSuccess(prefix, "Imaginea este diferita.");
            return true;
        }
    } catch(err) {
        const {logError} = require('./logConsole.js');
        logError(prefix, `Eroare la cautarea pentru similaritari ${err}.`);
    }
}


module.exports = {
    loadAnnoyIndex,
    convertImageToEmbeddedArray,
    searchForSimilarImage,
};
