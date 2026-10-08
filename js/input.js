import { state, patch, toggleJournal } from "./state.js";

export function bindInput() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    run(button.dataset.action);
  });

  document.addEventListener("keydown", (event) => {
    if (event.repeat) {
      return;
    }

    if (event.key === "Shift") {
      event.preventDefault();
      toggleJournal();
      return;
    }

    if (event.key === "Escape") {
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
        patch({ screen: "game", journalOpen: false });
      }
    }
  });
}

function run(action) {
  if (action === "to-rules") {
    patch({ screen: "rules" });
  }
  if (action === "to-title") {
    patch({ screen: "title", journalOpen: false });
  }
  if (action === "to-game") {
    patch({ screen: "game", journalOpen: false });
  }
  if (action === "close-journal") {
    patch({ journalOpen: false });
  }
}
