export const state = {
  screen: "title",
  hp: 100,
  maxHp: 100,
  journalOpen: false,
  entries: [],
  zoneName: "Le Seuil",
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
