// scripts/build-synonyms.js
const WordNet = require('node-wordnet')
const fs      = require('fs')
const path    = require('path')
const wnDB    = require('wordnet-db') // sau 'wndb-with-exceptions'
const dictPath = path.join(require.resolve('wordnet-db'), '..', 'dict')
const wn      = new WordNet({ dict: dictPath })

// 1) Pornim de la o bază extinsă manual
const BASE = {
  Tech: [
    'tech','computer','software',
    'hardware','peripheral','motherboard',
    'cpu','gpu','ram','ssd','hdd','router','modem',
    'network','server','database','programming','coding'
  ],
  Travel:    ['travel','vacation','trip'],
  Fashion:   ['fashion','style','ootd'],
  Lifestyle: ['lifestyle','wellness','fitness'],
  Beauty:    ['beauty','makeup','skincare'],
  Sport:    ['sport','ball','team'],
  Organising:['organize','arrange','tidy']
}

async function expandAll() {
  const out = {}
  for (const [cat, terms] of Object.entries(BASE)) {
    const set = new Set(terms)
    for (const t of terms) {
      try {
        const synsets = await wn.lookupAsync(t)
        synsets
          .flatMap(s => s.synonyms)
          .forEach(s => set.add(s.replace(/_/g,' ')))
      } catch (err) {
        console.warn(`No synsets for "${t}"`, err.message)
      }
    }
    // 2) Filtrăm după lungime şi complexitate
    out[cat] = Array.from(set)
      .filter(term => term.length >= 4 && term.split(' ').length <= 3)
      .filter((term, i, arr) => arr.indexOf(term) === i)
  }

  const outPath = path.join(__dirname, '..', 'data', 'synonyms.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8')
  console.log('✅ synonyms.json generated at', outPath)
}

expandAll().catch(err => {
  console.error('Error generating synonyms:', err)
  process.exit(1)
})
