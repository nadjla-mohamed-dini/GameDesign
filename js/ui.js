import { state, subscribe } from "./state.js";

export function bindUi() {
  const screens = document.querySelectorAll("[data-screen]");
  const vial = document.getElementById("vial");
  const liquid = document.getElementById("vial-liquid");
  const count = document.getElementById("vial-count");
  const zone = document.getElementById("zone-name");
  const journal = document.getElementById("journal");
  const list = document.getElementById("journal-list");
  const empty = document.getElementById("journal-empty");

  subscribe(render);
  render(state);

  function render(current) {
    screens.forEach((screen) => {
      screen.hidden = screen.dataset.screen !== current.screen;
    });

    const hp = Math.max(0, Math.min(current.maxHp, current.hp));
    liquid.style.height = `${(hp / current.maxHp) * 100}%`;
    count.textContent = String(hp);
    vial.setAttribute("aria-label", `Vie : ${hp} sur ${current.maxHp}`);
    zone.textContent = current.zoneName;

    const showJournal = current.screen === "game" && current.journalOpen;
    journal.hidden = !showJournal;

    list.replaceChildren();
    current.entries.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = entry.text;
      list.appendChild(item);
    });
    empty.hidden = current.entries.length > 0;

    if (showJournal) {
      journal.querySelector("[data-action='close-journal']").focus();
    } else if (document.activeElement?.closest("#journal")) {
      document.getElementById("stage").focus({ preventScroll: true });
    }
  }
}
