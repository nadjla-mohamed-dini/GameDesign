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
import { applyChoice, applyHit } from "./resolve.js";
import { presence, rest, seal, wound } from "./audio.js";

const HIT_RADIUS = 30;

export function startRoom() {
  const canvas = document.getElementById("room");
  const hint = document.getElementById("hint");
  let player = tileCenter(ROOMS.seuil.start.col, ROOMS.seuil.start.row);
  let note = "";
  let noteUntil = 0;
  let hurt = 0;
  let last = performance.now();
  let runId = state.runId;
  let seenRoom = state.roomId;
  let clock = { roomId: null, left: null, struck: false };
  const pressure = document.getElementById("pressure");

  subscribe((current) => {
    if (current.runId === runId) {
      return;
    }
    runId = current.runId;
    seenRoom = current.roomId;
    clock = { roomId: null, left: null, struck: false };
    pressure.hidden = true;
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
    const world = pointFromEvent(canvas, event);
    const actor = actorAt(state.roomId, world.x, world.y);
    if (!actor) {
      return;
    }
    const near = Math.hypot(player.x - actor.x, player.y - actor.y) <= HEAR_DISTANCE;
    if (!near) {
      note = "Trop loin pour l’entendre.";
      noteUntil = performance.now() + 1400;
      return;
    }
    const already = state.entries.some((entry) => entry.id === actor.id);
    if (actor.once && already) {
      patch({ dialogue: { speaker: actor.name, text: "Le coffre est vide." } });
      return;
    }
    const entries = already
      ? state.entries
      : [...state.entries, { id: actor.id, speaker: actor.name, text: actor.line }];
    patch({
      dialogue: { speaker: actor.name, text: actor.line },
      entries,
      stoneTaken: actor.id === "pierre-voeu" ? true : state.stoneTaken,
    });
  });

  canvas.addEventListener("mousemove", (event) => {
    if (state.dialogue) {
      canvas.style.cursor = "default";
      return;
    }
    const world = pointFromEvent(canvas, event);
    const actor = actorAt(state.roomId, world.x, world.y);
    const near = actor && Math.hypot(player.x - actor.x, player.y - actor.y) <= HEAR_DISTANCE;
    canvas.style.cursor = near ? "pointer" : "default";
  });

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (state.screen === "game") {
      const room = ROOMS[state.roomId];
      const axis = getAxis();
      player = move(room.map, player.x, player.y, axis.x * SPEED * dt, axis.y * SPEED * dt);
      const cell = tileAt(room.map, player.x, player.y);
      if (!state.dialogue && !state.journalOpen && room.exits[cell]) {
        enterCorridor(room.exits[cell]);
      }
      if (state.roomId !== seenRoom) {
        seenRoom = state.roomId;
        const start = ROOMS[seenRoom].start;
        player = tileCenter(start.col, start.row);
        passDoor();
      }
      presence({
        moving: axis.x !== 0 || axis.y !== 0,
        hp: state.hp,
        now,
      });
      hurt = Math.max(0, hurt - dt * 1.6);
      if (state.screen === "game") {
        tickPressure(dt);
      }
      if (state.screen === "game") {
        paint(now);
      }
    } else {
      rest();
    }
    requestAnimationFrame(frame);
  }

  function sting() {
    hurt = 1;
    wound();
  }

  function passDoor() {
    seal();
    const veil = document.getElementById("veil");
    veil.classList.add("is-down");
    window.setTimeout(() => veil.classList.remove("is-down"), 70);
  }

  function enterCorridor(exit) {
    const room = ROOMS[state.roomId];
    if (room.needsStone && !state.stoneTaken) {
      const start = room.start;
      player = tileCenter(start.col, start.row);
      patch({
        dialogue: { speaker: "Pierre", text: "La pierre t’attend encore." },
      });
      return;
    }
    const result = applyChoice(state, exit);
    if (exit.ending) {
      if (result.dead || result.shielded) {
        sting();
      }
      patch({
        hp: result.hp,
        shield: result.shield,
        streak: result.streak,
        ending: result.dead ? "mort" : exit.ending,
        screen: "ending",
        dialogue: null,
        journalOpen: false,
      });
      return;
    }
    if (result.dead) {
      sting();
      patch({
        hp: 0,
        shield: false,
        streak: 0,
        screen: "defeat",
        dialogue: null,
        journalOpen: false,
      });
      return;
    }
    if (!exit.correct || result.shielded) {
      sting();
    }
    const dest = ROOMS[exit.to];
    let text = result.shielded ? "La lueur cède à ta place. Tu passes." : exit.line;
    if (result.reward === "heal") {
      text += " Une fiole intacte te rend un peu de forces.";
    }
    if (result.reward === "shield") {
      text += " Une lueur froide se pose sur toi.";
    }
    patch({
      hp: result.hp,
      shield: result.shield,
      streak: result.streak,
      roomId: exit.to,
      zoneName: dest.zone,
      dialogue: { speaker: result.shielded || !exit.correct ? "Égaré" : "Pierre", text },
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
    const actors = actorsOf(room);
    const near = actors.find((actor) => Math.hypot(player.x - actor.x, player.y - actor.y) <= HEAR_DISTANCE);
    hint.textContent = hintFor(room, near, now);
    drawRoom(canvas.getContext("2d"), rect.width, rect.height, dpr, view, {
      map: room.map,
      torches: room.torches,
      scratches: room.scratches,
      warm: room.warm,
      tones: room.tones,
      labels: room.labels,
      actors,
      nearId: near ? near.id : null,
      player,
      hurt,
      time: now / 1000,
    });
    canvas.dataset.room = state.roomId;
    canvas.dataset.px = String(Math.round(player.x));
    canvas.dataset.py = String(Math.round(player.y));
    canvas.dataset.pressure = pressure.hidden ? "" : pressure.textContent;
    canvas.dataset.marks = JSON.stringify(
      actors.map((actor) => ({
        id: actor.id,
        x: Math.round(actor.x * view.scale + view.offsetX),
        y: Math.round(actor.y * view.scale + view.offsetY),
      }))
    );
  }

  function tickPressure(dt) {
    const room = ROOMS[state.roomId];
    if (clock.roomId !== state.roomId) {
      clock = { roomId: state.roomId, left: null, struck: false };
    }
    const ready = pressureReady(room);
    if (!ready || clock.struck) {
      pressure.hidden = true;
      return;
    }
    if (clock.left == null) {
      clock.left = room.seconds;
    }
    if (!state.journalOpen) {
      clock.left -= dt;
    }
    if (clock.left <= 0) {
      clock.left = 0;
      clock.struck = true;
      pressure.hidden = true;
      const blow = applyHit(state, 15);
      sting();
      if (blow.dead) {
        patch({
          hp: 0,
          shield: false,
          streak: blow.streak,
          screen: "defeat",
          dialogue: null,
          journalOpen: false,
        });
        return;
      }
      patch({
        hp: blow.hp,
        shield: blow.shield,
        dialogue: {
          speaker: "Égaré",
          text: blow.shielded
            ? "Le temps se ferme. La lueur cède à ta place."
            : "Le temps se ferme. Un Égaré entre. Tu gardes le choix.",
        },
      });
      return;
    }
    pressure.hidden = false;
    pressure.textContent = `Le labyrinthe presse — ${Math.ceil(clock.left)}`;
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
    if (near) {
      return `Clic — ${near.name} · Maj — carnet`;
    }
    if (Object.keys(room.exits).length > 0) {
      return "Entrer dans un couloir décide · Maj — carnet";
    }
    return "La pierre est proche · Maj — carnet";
  }

  requestAnimationFrame(frame);
}

function pressureReady(room) {
  if (!room.seconds) {
    return false;
  }
  if (state.dialogue) {
    return false;
  }
  if (room.arm === "stone") {
    return state.stoneTaken;
  }
  return room.actors.length > 0 && room.actors.every((actor) => state.entries.some((entry) => entry.id === actor.id));
}

function actorsOf(room) {
  return room.actors
    .map((actor) => {
      const spot = findMark(room.map, actor.mark);
      if (!spot) {
        return null;
      }
      return { ...actor, x: spot.x, y: spot.y };
    })
    .filter(Boolean);
}

function actorAt(roomId, x, y) {
  return actorsOf(ROOMS[roomId]).find((actor) => Math.hypot(actor.x - x, actor.y - y) <= HIT_RADIUS) || null;
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
