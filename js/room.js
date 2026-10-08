import { state, patch, subscribe } from "./state.js";
import { getAxis } from "./input.js";
import {
  HEAR_DISTANCE,
  SPEED,
  findMark,
  move,
  tileAt,
  tileCenter,
  viewOf,
} from "./collide.js";
import { drawRoom } from "./render.js";
import { ROOMS } from "./rooms.js";
import { wound } from "./resolve.js";

const LINE =
  "Le couloir de gauche sent le sang. J’en viens. Le droit mène à la salle des torches. Prends le droit.";

const HIT_RADIUS = 30;

export function startRoom() {
  const canvas = document.getElementById("room");
  const hint = document.getElementById("hint");
  const origin = ROOMS.seuil.start;
  let player = tileCenter(origin.col, origin.row);
  let note = "";
  let noteUntil = 0;
  let hurt = 0;
  let last = performance.now();
  let runId = state.runId;
  let seenRoom = state.roomId;

  subscribe((current) => {
    if (current.runId === runId) {
      return;
    }
    runId = current.runId;
    seenRoom = current.roomId;
    const start = ROOMS[current.roomId].start;
    player = tileCenter(start.col, start.row);
    note = "";
    noteUntil = 0;
    hurt = 0;
  });

  canvas.addEventListener("click", (event) => {
    if (state.screen !== "game" || state.journalOpen || state.dialogue) {
      return;
    }
    const eliane = elianeAt(state.roomId);
    if (!eliane) {
      return;
    }
    const world = pointFromEvent(canvas, event);
    const onEliane = Math.hypot(world.x - eliane.x, world.y - eliane.y) <= HIT_RADIUS;
    if (!onEliane) {
      return;
    }
    const near = Math.hypot(player.x - eliane.x, player.y - eliane.y) <= HEAR_DISTANCE;
    if (!near) {
      note = "Trop loin pour l’entendre.";
      noteUntil = performance.now() + 1400;
      return;
    }
    const entries = state.entries.some((entry) => entry.id === "eliane")
      ? state.entries
      : [...state.entries, { id: "eliane", speaker: "Eliane", text: LINE }];
    patch({
      dialogue: { speaker: "Eliane", text: LINE },
      entries,
    });
  });

  canvas.addEventListener("mousemove", (event) => {
    const eliane = elianeAt(state.roomId);
    if (!eliane || state.dialogue) {
      canvas.style.cursor = "default";
      return;
    }
    const world = pointFromEvent(canvas, event);
    const onEliane = Math.hypot(world.x - eliane.x, world.y - eliane.y) <= HIT_RADIUS;
    const near = Math.hypot(player.x - eliane.x, player.y - eliane.y) <= HEAR_DISTANCE;
    canvas.style.cursor = onEliane && near ? "pointer" : "default";
  });

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (state.screen === "game") {
      const room = ROOMS[state.roomId];
      const axis = getAxis();
      player = move(room.map, player.x, player.y, axis.x * SPEED * dt, axis.y * SPEED * dt);
      const cell = tileAt(room.map, player.x, player.y);
      if (!state.dialogue && !state.journalOpen && (cell === "L" || cell === "R")) {
        enterCorridor(cell);
      }
      if (state.roomId !== seenRoom) {
        seenRoom = state.roomId;
        const start = ROOMS[seenRoom].start;
        player = tileCenter(start.col, start.row);
      }
      hurt = Math.max(0, hurt - dt * 1.6);
      paint(now);
    }
    requestAnimationFrame(frame);
  }

  function enterCorridor(cell) {
    if (cell === "L") {
      const blow = wound(state.hp);
      hurt = 1;
      if (blow.dead) {
        patch({ hp: 0, screen: "defeat", dialogue: null, journalOpen: false });
        return;
      }
      player = tileCenter(2, 5);
      patch({
        hp: blow.hp,
        dialogue: {
          speaker: "Égaré",
          text: "Une forme trop longue sort des griffures. Tu recules, le souffle court.",
        },
      });
      return;
    }
    patch({
      roomId: "torches",
      zoneName: ROOMS.torches.name,
      dialogue: {
        speaker: "Pierre",
        text: "La salle des torches. Derrière toi, la pierre se referme.",
      },
    });
  }

  function paint(now) {
    const room = ROOMS[state.roomId];
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const view = viewOf(room.map, rect.width, rect.height);
    const eliane = elianeAt(state.roomId);
    const near = Boolean(eliane) && Math.hypot(player.x - eliane.x, player.y - eliane.y) <= HEAR_DISTANCE;
    hint.textContent = hintFor(room, near, now);
    drawRoom(canvas.getContext("2d"), rect.width, rect.height, dpr, view, {
      map: room.map,
      torches: room.torches,
      scratches: room.scratches,
      warm: room.warm,
      player,
      eliane,
      near,
      hurt,
      time: now / 1000,
    });
    canvas.dataset.room = state.roomId;
    canvas.dataset.px = String(Math.round(player.x));
    canvas.dataset.py = String(Math.round(player.y));
    if (eliane) {
      const mark = {
        x: eliane.x * view.scale + view.offsetX,
        y: eliane.y * view.scale + view.offsetY,
      };
      canvas.dataset.ex = String(Math.round(mark.x));
      canvas.dataset.ey = String(Math.round(mark.y));
    }
  }

  function hintFor(room, near, now) {
    if (now < noteUntil) {
      return note;
    }
    if (state.journalOpen) {
      return "Échap — fermer le carnet";
    }
    if (state.dialogue) {
      return "Échap — fermer";
    }
    if (room.eliane && near) {
      return "Clic — écouter Eliane · Maj — carnet";
    }
    if (findMark(room.map, "L")) {
      return "Entrer dans un couloir décide · Maj — carnet";
    }
    return "La pierre s’est refermée · Maj — carnet";
  }

  requestAnimationFrame(frame);
}

function elianeAt(roomId) {
  const room = ROOMS[roomId];
  if (!room.eliane) {
    return null;
  }
  return findMark(room.map, room.eliane);
}

function pointFromEvent(canvas, event) {
  const room = ROOMS[state.roomId];
  const rect = canvas.getBoundingClientRect();
  const view = viewOf(room.map, rect.width, rect.height);
  return {
    x: (event.clientX - rect.left - view.offsetX) / view.scale,
    y: (event.clientY - rect.top - view.offsetY) / view.scale,
  };
}
