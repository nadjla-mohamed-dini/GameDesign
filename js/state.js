import { readRelic } from "./relic.js";

export const state = {
  screen: "title",
  hp: 100,
  maxHp: 100,
  journalOpen: false,
  dialogue: null,
  entries: [],
  pins: [],
  mistakes: [],
  relic: readRelic(),
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

export function togglePin(id) {
  if (!state.entries.some((entry) => entry.id === id)) {
    return;
  }
  let pins;
  if (state.pins.includes(id)) {
    pins = state.pins.filter((pin) => pin !== id);
  } else if (state.pins.length >= 2) {
    pins = [state.pins[1], id];
  } else {
    pins = [...state.pins, id];
  }
  patch({ pins });
}

export function restartRun() {
  patch({
    screen: "game",
    hp: 100,
    journalOpen: false,
    dialogue: null,
    entries: [],
    pins: [],
    mistakes: [],
    relic: readRelic(),
    zoneName: "Le Seuil",
    roomId: "seuil",
    runId: state.runId + 1,
    shield: false,
    streak: 0,
    stoneTaken: false,
    ending: null,
  });
}
