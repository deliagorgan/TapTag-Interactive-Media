const { logSigmoid } = require('@tensorflow/tfjs');
const path = require('path');
const fs   = require('fs').promises;

const prefix = "LOG(validateTextContent.js): "

let DATA = null;

const DIACRITIC_MAP = {
    'ă':'a','Ă':'A','â':'a','Â':'A',
    'î':'i','Î':'I','ș':'s','Ș':'S',
    'ț':'t','Ț':'T'
  };
  
  /** 
   * Normalize a text into an array of lowercase, diacritic-free tokens 
   */
function normalize(text) {
    const {changeRomanianCharacters} = require('./validateTextContent');
    // 1) replace diacritics with ascii
    let s = changeRomanianCharacters(text || '');
    // 2) lowercase
    s = s.toLowerCase();
    // 3) strip any remaining diacritics (just in case)
    s = s.replace(/[ĂÂÎȘŞȚŢăâîșşțţ]/g, ch => DIACRITIC_MAP[ch] || ch);
    // 4) split on any non-alphanumeric chars
    return s.split(/[^a-z0-9]+/).filter(Boolean);
  }

async function loadSynonyms() {
    const {logError, logSuccess} = require('./logConsole');

    try {
        const filePath = path.resolve(__dirname, '..', 'data', 'synonyms.json');

        const raw = await fs.readFile(filePath, 'utf-8');

        DATA = JSON.parse(raw);

        logSuccess(prefix, `Datele au fost incarcate cu succes!`);
        return true;
    } catch (err) {
        logError(prefix, `Failed to load synonyms: ${err}`);
        return false;
    }

}

function tokensToString(tokens) {
    return ' ' + tokens.join(' ') + ' ';
}

async function classifyText(text, threshold = 1) {
    const tokens = normalize(text);
    if (!tokens.length) return [];
  
    const haystack = tokensToString(tokens);
    const results = [];
  
    // 1) Score each category
    for (const [cat, phrases] of Object.entries(DATA)) {
      let score = 0;
      for (const phrase of phrases) {
        const norm = normalize(phrase).join(' ');

        if (!norm)
            continue;
        const needle = ' ' + norm + ' ';
        let idx = haystack.indexOf(needle);
        while (idx !== -1) {
          score++;
          idx = haystack.indexOf(needle, idx + needle.length);
        }
      }
      // 2) Keep those above threshold
      if (score >= threshold) {
        results.push({ cat, score });
      }
    }
  
    // 3) Sort descending by score
    results.sort((a, b) => b.score - a.score);

    if (results.length === 0)
        return ['Other'];
  
    // 4) Return only the category names
    return results.map(r => r.cat);
}


module.exports = {
    loadSynonyms,
    classifyText
};
