import { state, patch } from "./state.js";
import { getAxis } from "./input.js";
import {
  HEAR_DISTANCE,
  SPEED,
  findMark,
  move,
  tileCenter,
  viewOf,
} from "./collide.js";
import { drawRoom } from "./render.js";

const LINE =
  "Le couloir de gauche sent le sang. J’en viens. Le droit mène à la salle des torches. Prends le droit.";

const HIT_RADIUS = 30;

export function startRoom() {
  const canvas = document.getElementById("room");
  const hint = document.getElementById("hint");
  const eliane = findMark("E");
  let player = tileCenter(6, 9);
  let note = "";
  let noteUntil = 0;
  let last = performance.now();

  canvas.addEventListener("click", (event) => {
    if (state.screen !== "game" || state.journalOpen) {
      return;
    }
    if (state.dialogue) {
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
    const world = pointFromEvent(canvas, event);
    const onEliane = Math.hypot(world.x - eliane.x, world.y - eliane.y) <= HIT_RADIUS;
    const near = Math.hypot(player.x - eliane.x, player.y - eliane.y) <= HEAR_DISTANCE;
    canvas.style.cursor = onEliane && near && !state.dialogue ? "pointer" : "default";
  });

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (state.screen === "game") {
      const axis = getAxis();
      player = move(player.x, player.y, axis.x * SPEED * dt, axis.y * SPEED * dt);
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      }
      const view = viewOf(rect.width, rect.height);
      const near = Math.hypot(player.x - eliane.x, player.y - eliane.y) <= HEAR_DISTANCE;
      hint.textContent = hintFor(near, now);
      const ctx = canvas.getContext("2d");
      drawRoom(ctx, rect.width, rect.height, dpr, view, {
        player,
        eliane,
        near,
        time: now / 1000,
      });
      const mark = worldToCss(eliane, view);
      canvas.dataset.ex = String(Math.round(mark.x));
      canvas.dataset.ey = String(Math.round(mark.y));
      canvas.dataset.px = String(Math.round(player.x));
      canvas.dataset.py = String(Math.round(player.y));
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  function hintFor(near, now) {
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
      return "Clic — écouter Eliane · Maj — carnet";
    }
    return "ZQSD — marcher · Maj — carnet";
  }
}

function pointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const view = viewOf(rect.width, rect.height);
  return {
    x: (event.clientX - rect.left - view.offsetX) / view.scale,
    y: (event.clientY - rect.top - view.offsetY) / view.scale,
  };
}

function worldToCss(point, view) {
  return {
    x: point.x * view.scale + view.offsetX,
    y: point.y * view.scale + view.offsetY,
  };
}
