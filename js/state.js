export const state = {
  screen: "title",
  hp: 100,
  maxHp: 100,
  journalOpen: false,
  dialogue: null,
  entries: [],
  zoneName: "Le Seuil",
  roomId: "seuil",
  runId: 1,
  shield: false,
  streak: 0,
  stoneTaken: false,
  ending: null,
};

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function patch(partial) {
  Object.assign(state, partial);
  listeners.forEach((listener) => listener(state));
}

export function toggleJournal() {
  if (state.screen !== "game") {
    return;
  }
  patch({ journalOpen: !state.journalOpen });
}

export function restartRun() {
  patch({
    screen: "game",
    hp: 100,
    journalOpen: false,
    dialogue: null,
    entries: [],
    zoneName: "Le Seuil",
    roomId: "seuil",
    runId: state.runId + 1,
    shield: false,
    streak: 0,
    stoneTaken: false,
    ending: null,
  });
}
