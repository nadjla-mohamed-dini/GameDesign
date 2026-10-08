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
  const dialogue = document.getElementById("dialogue");
  const dialogueSpeaker = document.getElementById("dialogue-speaker");
  const dialogueText = document.getElementById("dialogue-text");

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
      const speaker = document.createElement("span");
      speaker.className = "journal__who";
      speaker.textContent = entry.speaker;
      const quote = document.createElement("p");
      quote.textContent = entry.text;
      item.append(speaker, quote);
      list.appendChild(item);
    });
    empty.hidden = current.entries.length > 0;

    const showDialogue = current.screen === "game" && Boolean(current.dialogue);
    dialogue.hidden = !showDialogue;
    if (showDialogue) {
      dialogueSpeaker.textContent = current.dialogue.speaker;
      dialogueText.textContent = current.dialogue.text;
    }

    if (showJournal) {
      journal.querySelector("[data-action='close-journal']").focus();
    } else if (showDialogue) {
      dialogue.querySelector("[data-action='close-dialogue']").focus();
    } else if (document.activeElement?.closest("#journal, #dialogue")) {
      document.getElementById("stage").focus({ preventScroll: true });
    }
  }
}
