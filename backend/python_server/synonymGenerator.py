import json
import os
import sys
from nltk.corpus import wordnet as wn
# Pentru sinonime românești folosim Open Multilingual WordNet

# Asigurați-vă că ați descărcat datele NLTK:
#   python -m nltk.downloader wordnet omw-1.4

# 1) Bază extinsă de seed words (engleză + română)
BASE = {
    "Tech": [
        # English seeds
        'tech','computer','software','hardware','peripheral',
        'motherboard','cpu','gpu','ram','ssd','hdd','router',
        'modem','network','server','database','programming',
        'coding','ai','machine learning','blockchain','iot',
        'robotics','startup','electronics','gadget',
        # Romanian seeds
        'tehnologie','calculator','software','hardware','periferic',
        'placă de bază','procesor','placă grafică','memorie','stocare',
        'rețea','server','bază de date','programare','codare',
        'inteligență artificială','învățare automată','lanț blocuri',
        'internetul obiectelor','robotică','electronice'
    ],
    "Travel": [
        # English seeds
        'travel','vacation','trip','journey','cruise','expedition',
        'backpacking','tourism','destination','adventure','explore',
        # Romanian seeds
        'călătorie','vacanță','excursie','drumeție','turism',
        'destinație','aventură','croazieră','expediție','rucsac'
    ],
    "Fashion": [
        'fashion','style','ootd','trend','runway','couture','apparel',
        'accessory','modă','tendință','șic','eleganță','îmbrăcăminte',
        'accesoriu'
    ],
    "Lifestyle": [
        'lifestyle','wellness','fitness','mindfulness','minimalism',
        'home decor','sustainability','stil de viață','sănătate',
        'nutriție','amenajare','deco'
    ],
    "Beauty": [
        'beauty','makeup','skincare','cosmetics','facial','beautycare',
        'haircare','fragrance','frumusețe','machiaj','îngrijire facială',
        'cosmetică','tratament','parfumerie'
    ],
    "Sport": [
        'sport','ball','team','athletics','workout','exercise','match',
        'tournament','fitness','sportivi','antrenament','competiție',
        'joc','echipă','campionat'
    ],
    "Organising": [
        'organize','arrange','tidy','planner','schedule','workflow',
        'declutter','categorize','organizing','organizare','aranjare',
        'ordonare','flux de lucru','declutterizare','clasificare','curățenie'
    ],
"Pets": [
  "pet",
  "pets",
  "companion animal",
  "companion pet",
  "domestic animal",
  "dog",
  "dogs",
  "puppy",
  "puppies",
  "canine",
  "cat",
  "cats",
  "kitten",
  "kittens",
  "feline",
  "rabbit",
  "rabbits",
  "bunny",
  "bunnies",
  "hamster",
  "hamsters",
  "guinea pig",
  "guinea pigs",
  "rodent",
  "bird",
  "birds",
  "parrot",
  "parrots",
  "fish",
  "goldfish",
  "turtle",
  "turtles",
  "animal de companie",
  "animale de companie",
  "animale domestice",
  "caine",
  "câine",
  "caini",
  "câini",
  "catel",
  "căţel",
  "catelus",
  "căţeluş",
  "pisica",
  "pisică",
  "pisici",
  "pui de pisică",
  "iepure",
  "iepuri",
  "iepuras",
  "iepuraș",
  "hamster",
  "hamsteri",
  "porcusor de guineea",
  "porcușor de guineea",
  "soarece de camp",
  "pasare",
  "pasari",
  "papagal",
  "papagali",
  "peste",
  "pesti",
  "broasca testoasa",
  "broaste testoase"
]

}

# Funcție de extragere sinonime din WordNet (engleză) și OMW (română)
def get_synonyms(term):
    syns = set()
    for syn in wn.synsets(term, lang='eng'):
        for lemma in syn.lemmas():
            syns.add(lemma.name().replace('_', ' ').lower())
    for syn in wn.synsets(term, lang='ron'):
        for lemma in syn.lemmas(lang='ron'):
            syns.add(lemma.name().replace('_', ' ').lower())
    return syns

def generateSynonyms():
    # Expansiune și filtrare
    out = {}
    for cat, seeds in BASE.items():
        all_terms = set(t.lower() for t in seeds)
        for term in seeds:
            term_l = term.lower()
            try:
                synonyms = get_synonyms(term_l)
                all_terms.update(synonyms)
            except Exception as e:
                print(f"Warning: couldn't lookup '{term_l}' → {e}", file=sys.stderr)
        # Filtrare: lungime 4-30 caractere, 1-3 cuvinte
        filtered = [t for t in all_terms
                    if 3 < len(t) <= 30 and 1 <= t.count(' ')+1 <= 3]
        out[cat] = sorted(set(filtered))

    # Salvare JSON
    out_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(out_dir, exist_ok=True)

    out_path = os.path.join(out_dir, 'synonyms.json')

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"✅ Generated synonyms.json with categories: {', '.join(out.keys())}")
