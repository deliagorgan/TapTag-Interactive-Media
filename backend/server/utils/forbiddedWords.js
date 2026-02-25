/*
    cuvinte interzise in romana
*/
const bannedRomanianWords = [ "interzis", "prost", "proasta", "prosti", "proaste",
"idiot", "idiota", "idioti", "idiote",
"bou", "boii", "boul", "boului",
"nebun", "nebuna", "nebuni", "nebune",
"fraier", "fraiera", "fraieri", "fraiere",
"cretin", "cretina", "cretini", "cretine",
"nesimtit", "nesimtita", "nesimtiti", "nesimtite",
"porc", "porcoasa", "porci",
"javra", "javre",
"pustiu", "terminat", "ratat", "ratata",
"panarama", "panarame",
"mizerabil", "mizerabila", "mizerabili",
"idiotule", "dobitoc", "dobitoca", "dobitoci", "dobitoace",
"jigodie", "jigodii",
"imbecil", "imbecila", "imbecili",
"mars", "marsule",
"muie", "mue", "muiere",
"curva", "curve",
"fut", "futai", "futut", "fututa", "fututi",
"pula", "puli", "pulii", "pulica", "pulica", "puta",
"pizda", "pizde", "pizdita", "pizduta",
"mortii", "mortilor", "mortu", "mortule",
"dracu", "dracului", "dracule",
"sa te ia dracu", "fir-ai al dracu", "du-te dracului",
"caca", "cacat", "cacati",
"rahat", "rahatului", "rahatule",
"belit", "belita", "beliti",
"spalat pe creier", "cacacios", "cacacioasa",
"boul dracu", "panarama dracului",
"ghertoi", "ghertoanca", "ghertoiule",
"taranoi", "taranca", "taranoiule", "taran",
"motoc", "motocoasa", "motoci",
"babo", "baba", "babalac", "pocitanie", "pocitanii"
];


/*
    cuvinte intersize in engleza
*/
const bannedEnglishWords = [
    "fuck", "fuk", "fuq", "fck", "fuxk",
    "fucking", "fuckin", "fuqing", "fukin",
    "shit", "sh1t", "shet",
    "bullshit", "bullsh1t", "bullsheeet",
    "asshole", "ass", "arse", "arsehole",
    "bitch", "biatch", "b1tch", "b!tch",
    "bastard", "bastards",
    "damn", "damnit", "dammit",
    "crap",
    "dick", "d1ck", "d!ck",
    "dumb", "dumbass",
    "motherfucker", "motherfuckin", "muthafucka",
    "slut", "s1ut", "slutt",
    "whore", "w***e", "h00r",
    "pussy", "pusy", "pussi", "pussies",
    "cock", "c0ck", "cawk",
    "nigger", "nigga", "ni99a", "n1gga",
    "retard", "retarded",
    "loser", "moron", "idiot",
    "stupid", "stfu", "gtfo",
    "die", "drop dead", "go to hell", "kill yourself", "kys"
];


const bannedWords = new Set([...bannedRomanianWords, ...bannedEnglishWords]);


module.exports = {bannedWords};
