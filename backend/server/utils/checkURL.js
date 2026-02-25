const axios = require('axios');

const prefix = 'LOG(checkURL.js): ';

/*
    functie care trimite catre google un link pentru a-l valida
    returneaza true daca link-ul este sigur
*/
async function isURLSafe(url) {
    const {logError} = require('./logConsole');

    const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

    const body = {
        client: {
        clientId: "myApp",
        clientVersion: "1.0.0"
        },
        threatInfo: {
        threatTypes: ["MALWARE","SOCIAL_ENGINEERING"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }]
        }
    };

    try {
        const { data } = await axios.post(endpoint, body, {
            headers: { "Content-Type": "application/json" }
        });

        return data.matches == null;
    } catch (err) {
        logError(prefix, `Safe Browsing error: ${err}`);
        return true;
    }
}

module.exports = {isURLSafe};
