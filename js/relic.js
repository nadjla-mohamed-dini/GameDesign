const KEY = "menteurs-relique";

const LINES = {
  seuil: {
    name: "Page ancienne",
    text: "Un autre Malakai a écrit : les griffures étaient à gauche, et le cercle net était à droite.",
    col: 4,
    row: 3,
  },
  arches: {
    name: "Page ancienne",
    text: "Un autre Malakai a écrit : la première arche, à gauche, était ouverte.",
    col: 9,
    row: 6,
  },
  voix: {
    name: "Page ancienne",
    text: "Un autre Malakai a écrit : Corvin n’avait pas marché dans le couloir du nord.",
    col: 7,
    row: 6,
  },
  affiche: {
    name: "Page ancienne",
    text: "Un autre Malakai a écrit : le mot coupé se finissait par GAUCHE.",
    col: 5,
    row: 6,
  },
  hale: {
    name: "Page ancienne",
    text: "Un autre Malakai a écrit : les empreintes fraîches partaient à droite.",
    col: 10,
    row: 6,
  },
  coeur: {
    name: "Page ancienne",
    text: "Un autre Malakai a écrit : au Cœur, la lumière attire.",
    col: 7,
    row: 7,
  },
  pierre: {
    name: "Page ancienne",
    text: "Un autre Malakai a écrit : la porte basse était usée par les pas.",
    col: 7,
    row: 7,
  },
};

export function readRelic() {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    const line = data && LINES[data.roomId];
    if (!line) {
      return null;
    }
    return { roomId: data.roomId, ...line };
  } catch {
    return null;
  }
}

export function sealRelic(mistakes, roomId) {
  if (typeof localStorage === "undefined") {
    return;
  }
  const failed = Array.isArray(mistakes) && mistakes.length > 0 ? mistakes[0] : null;
  let id = failed || roomId;
  if (!failed && roomId === "pierre") {
    id = "coeur";
  }
  if (!LINES[id]) {
    id = "voix";
  }
  localStorage.setItem(KEY, JSON.stringify({ roomId: id }));
}
