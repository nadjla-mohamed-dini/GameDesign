import { state, patch, toggleJournal } from "./state.js";

const held = new Set();

export function getAxis() {
  if (state.screen !== "game" || state.journalOpen || state.dialogue) {
    return { x: 0, y: 0 };
  }
  let x = 0;
  let y = 0;
  if (held.has("left")) x -= 1;
  if (held.has("right")) x += 1;
  if (held.has("up")) y -= 1;
  if (held.has("down")) y += 1;
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x, y };
}

export function bindInput() {
  window.addEventListener("blur", () => held.clear());
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    run(button.dataset.action);
  });

  document.addEventListener("keydown", (event) => {
    const direction = directionFrom(event);
    if (direction && state.screen === "game") {
      event.preventDefault();
      if (!event.repeat) {
        held.add(direction);
      }
    }

    if (event.repeat) {
      return;
    }

    if (event.key === "Shift") {
      event.preventDefault();
      toggleJournal();
      return;
    }

    if (event.key === "Escape") {
      if (state.dialogue) {
        patch({ dialogue: null });
        return;
      }
      if (state.journalOpen) {
        patch({ journalOpen: false });
        return;
      }
      if (state.screen === "rules") {
        patch({ screen: "title" });
      }
      return;
    }

    if (event.key === "Enter" && event.target.tagName !== "BUTTON") {
      if (state.screen === "title") {
        patch({ screen: "rules" });
      } else if (state.screen === "rules") {
        patch({ screen: "game", journalOpen: false, dialogue: null });
        document.getElementById("stage").focus();
      }
    }
  });

  document.addEventListener("keyup", (event) => {
    const direction = directionFrom(event);
    if (direction) {
      held.delete(direction);
    }
  });
}

function directionFrom(event) {
  const key = event.key.toLowerCase();
  if (key === "z" || key === "arrowup" || event.code === "KeyW") return "up";
  if (key === "s" || key === "arrowdown" || event.code === "KeyS") return "down";
  if (key === "q" || key === "arrowleft" || event.code === "KeyA") return "left";
  if (key === "d" || key === "arrowright" || event.code === "KeyD") return "right";
  return null;
}

function run(action) {
  if (action === "to-rules") {
    patch({ screen: "rules" });
  }
  if (action === "to-title") {
    patch({ screen: "title", journalOpen: false });
  }
  if (action === "to-game") {
    patch({ screen: "game", journalOpen: false, dialogue: null });
    document.getElementById("stage").focus();
  }
  if (action === "close-journal") {
    patch({ journalOpen: false });
  }
  if (action === "close-dialogue") {
    patch({ dialogue: null });
  }
}
