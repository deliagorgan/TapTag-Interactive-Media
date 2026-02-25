const {logError, logSuccess } = require('./logConsole.js');

const pythonAPI = `http://localhost:${process.env.PYTHON_SERVER_PORT}/api/python/`;
const prefix = 'LOG(metadataManipulation.js): ';


/*
    functie care primeste imaginea codificata in base64
    si returneaza imaginea cu mesajul ascuns tot in base64
*/
async function insertAndCheckData(imageBase64, data) {
    try {
        /*
            trimitem imaginea si datele catre serverul python
        */
        const response = await fetch(pythonAPI + 'addData/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageBase64: imageBase64,
                data: data
            }),
        });

        /*
            se asteapta raspunsul de la serverul python
        */
        const result = await response.json();

        if (response.ok) {
            logSuccess(prefix, `Au fost inserate metadatele in imagine.`);
            return result.imageBase64;
        } else {
            logError(prefix, `Eroare de la server: ${result}`);
            return null;
        }
    } catch (err) {
        logError(prefix, `Eroare la inserarea datelor in imagine: ${err}.`);
        return null;
    }
}

/*
    functie care modifica informatiile din imagine
*/
async function modifyData(imageBase64, data) {
    try {
        const response = await fetch(pythonAPI + 'modifyData/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageBase64: imageBase64,
                data: data
            }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Success:', result);
            return result.imageBase64;
        } else {
            console.error('Error from server:', result);
            return null;
        }
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}


/*
    functie care extrage informatiile din imagine fara
    a le sterge din imagine
*/
async function extractData(imageBase64) {
    try {
        const response = await fetch(pythonAPI + 'extractData/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageBase64: imageBase64,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            return result.data;
        } else {
            console.error('Error from server:', result);
            return null;
        }
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}

module.exports = {
    insertAndCheckData,
    modifyData,
    extractData
};
