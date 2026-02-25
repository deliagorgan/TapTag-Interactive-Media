
const {bannedWords} = require('./forbiddedWords');

const prefix = "LOG(validateTextContent.js): "

const diacritice = {
    'ă': 'a', 'Ă': 'A',
    'â': 'a', 'Â': 'A',
    'î': 'i', 'Î': 'I',
    'ș': 's', 'Ș': 'S',
    'ț': 't', 'Ț': 'T'
};

/*
    functie care returneaza un text modificat care inlocuieste diacriticele
*/
function changeRomanianCharacters(text) {
    try {
      if (!text) return '';
     
      const pattern = new RegExp(Object.keys(diacritice).join('|'), 'g');

      return text.replace(pattern, match => diacritice[match] || match);
    } catch (err) {

      logError(prefix, `Eroare la eliminarea diacriticelor: ${err}`);
      return null;
    }
  }

/*
    fucntie care verifica daca un text contine cuvinte interzise
*/
async function checkTextForBannedWords(text) {
    const {logError} = require('./logConsole');

    try {
        /*
            elimina diacriticele daca exista
        */
        const cleanText = changeRomanianCharacters(text);

        const tokens = (cleanText || '').toLowerCase().match(/\b\w+\b/g) || [];
  
        for (const word of tokens) {
            if (bannedWords.has(word)) {
                return true;
            }
        }

        return false;
    } catch(err) {
        logError(prefix, `Eroare la validarea textului: ${err}`);
        return true;
    }
}

module.exports = {
    changeRomanianCharacters,
    checkTextForBannedWords
};
