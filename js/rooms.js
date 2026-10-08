const CALM = "Le passage est vide. Derrière toi, la pierre se referme.";
const HURT = "Un Égaré te saisit, puis le couloir te recrache plus loin.";

const BAND = [
  "################",
  "#..............#",
  "#..............#",
  "#..............#",
  "................",
  "................",
  "................",
  "#..............#",
  "#..............#",
  "#..............#",
  "################",
];

function withExits(rows, left, right) {
  return rows.map((row, index) => {
    if (row.startsWith("#")) {
      return row;
    }
    return left + row.slice(1, -1) + right;
  });
}

export const ROOMS = {
  seuil: {
    zone: "Le Seuil",
    start: { col: 4, row: 5 },
    scratches: true,
    warm: false,
    map: withExits(BAND, "L", "R").map((row, index) =>
      index === 5 ? "L........E.....R" : row
    ),
    torches: [
      { col: 8, row: 1.4 },
      { col: 14.2, row: 5.2 },
    ],
    tones: { L: "blood", R: "warm" },
    labels: { L: "Gauche", R: "Droit" },
    actors: [
      {
        id: "eliane",
        mark: "E",
        name: "Eliane",
        kind: "person",
        cloak: "#6e6256",
        line: "Le couloir de gauche sent le sang. J’en viens. Le droit mène à la salle des torches. Prends le droit.",
      },
    ],
    exits: {
      L: { to: "arches", damage: 20, correct: false, line: HURT },
      R: { to: "arches", damage: 0, correct: true, line: CALM },
    },
  },
  arches: {
    zone: "Le Seuil",
    start: { col: 7, row: 6 },
    scratches: false,
    warm: false,
    map: [
      "################",
      "#..............#",
      "#..............#",
      "#.....####.....#",
      "L.....####.....R",
      "L......C.......R",
      "L..............R",
      "#.....####.....#",
      "#..............#",
      "#..............#",
      "################",
    ],
    torches: [
      { col: 2, row: 1.5 },
      { col: 13, row: 1.5 },
    ],
    tones: { L: "warm", R: "blood" },
    labels: { L: "Première", R: "Troisième" },
    actors: [
      {
        id: "coffre-arches",
        mark: "C",
        name: "Coffre",
        kind: "chest",
        once: true,
        line: "Trois arches. Celle du milieu est effondrée. Passe sous la première.",
      },
    ],
    exits: {
      L: { to: "voix", damage: 0, correct: true, line: CALM },
      R: { to: "voix", damage: 25, correct: false, line: HURT },
    },
  },
  voix: {
    zone: "Les Voix",
    seconds: 20,
    start: { col: 7, row: 4 },
    scratches: false,
    warm: false,
    map: [
      "######UUUU######",
      "#..............#",
      "#..............#",
      "#..............#",
      "#..V.......A...E",
      "#..............E",
      "#..............E",
      "#..............E",
      "#..............#",
      "#..............#",
      "################",
    ],
    torches: [
      { col: 3, row: 2 },
      { col: 12, row: 6 },
    ],
    tones: { U: "blood", E: "warm" },
    labels: { U: "Nord", E: "Est" },
    actors: [
      {
        id: "corvin",
        mark: "V",
        name: "Corvin",
        kind: "person",
        cloak: "#4a4038",
        line: "Nessa a perdu l’esprit. Le passage du nord est sûr, je l’ai pris ce matin.",
      },
      {
        id: "nessa",
        mark: "A",
        name: "Nessa",
        kind: "person",
        cloak: "#7d6a62",
        line: "Le nord gronde. J’ai vu une ombre. L’est est calme, j’en suis sûre… je crois.",
      },
    ],
    exits: {
      U: { to: "affiche", damage: 30, correct: false, line: HURT },
      E: { to: "affiche", damage: 0, correct: true, line: CALM },
    },
  },
  affiche: {
    zone: "Les Voix",
    seconds: 20,
    start: { col: 7, row: 6 },
    scratches: false,
    warm: false,
    map: withExits(BAND, "L", "R").map((row, index) =>
      index === 3 ? "#......I.......#" : row
    ),
    torches: [{ col: 8, row: 1.5 }],
    tones: { L: "dark", R: "blood" },
    labels: { L: "Gauche", R: "Droit" },
    actors: [
      {
        id: "affiche",
        mark: "I",
        name: "Affiche",
        kind: "note",
        line: "DROITE : MORT. GAU…",
      },
    ],
    exits: {
      L: { to: "hale", damage: 0, correct: true, line: CALM },
      R: { to: "hale", damage: 30, correct: false, line: HURT },
    },
  },
  hale: {
    zone: "Les Voix",
    seconds: 20,
    start: { col: 7, row: 6 },
    scratches: false,
    warm: false,
    map: withExits(BAND, "L", "R").map((row, index) => {
      if (index === 3) return "#......C.......#";
      if (index === 5) return "L......H.......R";
      return row;
    }),
    torches: [{ col: 4, row: 1.5 }, { col: 12, row: 1.5 }],
    tones: { L: "blood", R: "warm" },
    labels: { L: "Gauche", R: "Droit" },
    actors: [
      {
        id: "hale",
        mark: "H",
        name: "Hale",
        kind: "person",
        cloak: "#5c5348",
        line: "La vieille carte dit la gauche. J’en suis certain.",
      },
      {
        id: "coffre-hale",
        mark: "C",
        name: "Coffre",
        kind: "chest",
        once: true,
        line: "Le trait juste pointe à droite. La gauche est barrée.",
      },
    ],
    exits: {
      L: { to: "coeur", damage: 30, correct: false, line: HURT },
      R: { to: "coeur", damage: 0, correct: true, line: CALM },
    },
  },
  coeur: {
    zone: "Le Cœur",
    seconds: 10,
    start: { col: 7, row: 6 },
    scratches: false,
    warm: false,
    map: [
      "################",
      "#..............#",
      "#..S.......P...#",
      "#......M.......#",
      "D..............B",
      "D..............B",
      "D..............B",
      "#..............#",
      "#..............#",
      "#..............#",
      "################",
    ],
    torches: [
      { col: 14, row: 5 },
      { col: 2, row: 2 },
    ],
    tones: { D: "dark", B: "warm" },
    labels: { D: "Sombre", B: "Lumière" },
    actors: [
      {
        id: "sans-nom",
        mark: "S",
        name: "Le Sans-Nom",
        kind: "person",
        cloak: "#2e2a28",
        line: "Pas… la lumière. La lumière… attire. Sombre… couloir… vivant.",
      },
      {
        id: "note-mort",
        mark: "M",
        name: "Note",
        kind: "note",
        line: "J’ai suivi les torches. Elles m’ont mené à eux.",
      },
      {
        id: "affiche-lumiere",
        mark: "P",
        name: "Affiche",
        kind: "note",
        line: "Suivez la lumière, elle ne ment jamais.",
      },
    ],
    exits: {
      D: { to: "pierre", damage: 0, correct: true, line: "La pierre est proche. Le chemin derrière toi n’existe plus." },
      B: { to: "pierre", damage: 35, correct: false, line: HURT },
    },
  },
  pierre: {
    zone: "Le Cœur",
    seconds: 10,
    arm: "stone",
    needsStone: true,
    start: { col: 7, row: 6 },
    scratches: false,
    warm: true,
    map: [
      "################",
      "#..............#",
      "#..............#",
      "#..P.......I...#",
      "D..............B",
      "D..............B",
      "D..............B",
      "#..............#",
      "#..............#",
      "#..............#",
      "################",
    ],
    torches: [
      { col: 14, row: 5 },
      { col: 3, row: 2 },
    ],
    tones: { D: "dark", B: "warm" },
    labels: { D: "Porte basse", B: "Lumière" },
    actors: [
      {
        id: "pierre-voeu",
        mark: "P",
        name: "Pierre",
        kind: "note",
        line: "Formule le vœu. Tu es libre. La grande porte lumineuse est la sortie. L’autre se referme sur les voleurs.",
      },
      {
        id: "inscription-basse",
        mark: "I",
        name: "Inscription",
        kind: "note",
        line: "La sortie est la porte basse, sans torche.",
      },
    ],
    exits: {
      D: { ending: "lucide", damage: 0, correct: true, line: "" },
      B: { ending: "brisee", damage: 40, correct: false, line: "" },
    },
  },
};

export const ENDINGS = {
  lucide: {
    eyebrow: "Dehors",
    title: "La porte basse",
    text: "Tu sors, la pierre dans la main. Liora est peut-être malade. Le labyrinthe a peut-être inventé le vœu. Une dernière ligne s’écrit seule : « Malakai dit toujours la vérité. »",
  },
  brisee: {
    eyebrow: "Dehors, de justesse",
    title: "La pierre fêlée",
    text: "La grande porte te recrache. La pierre est fendue. Tu ne sais plus si elle a jamais exaucé quoi que ce soit.",
  },
  mort: {
    eyebrow: "Sans retour",
    title: "Tu restes",
    text: "La grande porte se referme sur toi. Le labyrinthe garde une voix de plus, pour le prochain voyageur.",
  },
};
