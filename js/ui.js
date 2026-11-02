import { ENDINGS } from "./rooms.js";
import { state, subscribe } from "./state.js";

export function bindUi() {
  const screens = document.querySelectorAll("[data-screen]");
  const vial = document.getElementById("vial");
  const liquid = document.getElementById("vial-liquid");
  const count = document.getElementById("vial-count");
  const zone = document.getElementById("zone-name");
  const shield = document.getElementById("shield");
  const journal = document.getElementById("journal");
  const list = document.getElementById("journal-list");
  const empty = document.getElementById("journal-empty");
  const pinNote = document.getElementById("journal-pin-note");
  const face = document.getElementById("journal-face");
  const pair = document.getElementById("journal-pair");
  let journalWasOpen = false;
  let dialogueWasOpen = false;
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
    shield.hidden = !current.shield;

    const showJournal = current.screen === "game" && current.journalOpen;
    journal.hidden = !showJournal;

    const pinned = current.pins
      .map((id) => current.entries.find((entry) => entry.id === id))
      .filter(Boolean);
    face.hidden = pinned.length < 2;
    pair.replaceChildren();
    pinned.forEach((entry) => {
      pair.appendChild(quoteCard(entry));
    });
    pinNote.hidden = current.entries.length === 0;
    pinNote.textContent = pinned.length >= 2
      ? "Deux lignes sont face à face."
      : "Épingle deux lignes pour les poser face à face.";

    list.replaceChildren();
    current.entries.forEach((entry) => {
      const item = document.createElement("li");
      const speaker = document.createElement("span");
      speaker.className = "journal__who";
      speaker.textContent = entry.speaker;
      const quote = document.createElement("p");
      quote.textContent = entry.text;
      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = "btn btn--ghost journal__pin";
      pin.dataset.action = "pin-entry";
      pin.dataset.id = entry.id;
      const held = current.pins.includes(entry.id);
      pin.textContent = held ? "Retirer" : "Épingler";
      pin.setAttribute("aria-pressed", String(held));
      item.append(speaker, quote, pin);
      list.appendChild(item);
    });
    empty.hidden = current.entries.length > 0;

    const showDialogue = current.screen === "game" && Boolean(current.dialogue);
    dialogue.hidden = !showDialogue;
    if (showDialogue) {
      dialogueSpeaker.textContent = current.dialogue.speaker;
      dialogueText.textContent = current.dialogue.text;
    }

    if (current.screen === "ending" && ENDINGS[current.ending]) {
      const ending = ENDINGS[current.ending];
      document.getElementById("ending-eyebrow").textContent = ending.eyebrow;
      document.getElementById("ending-title").textContent = ending.title;
      document.getElementById("ending-text").textContent = ending.text;
    }

    if (current.screen === "defeat") {
      document.querySelector("[data-screen='defeat'] [data-action='restart']").focus();
    } else if (current.screen === "ending") {
      document.querySelector("[data-screen='ending'] [data-action='restart']").focus();
    } else if (showJournal && !journalWasOpen) {
      journal.querySelector("[data-action='close-journal']").focus();
    } else if (showDialogue && !dialogueWasOpen) {
      dialogue.querySelector("[data-action='close-dialogue']").focus();
    } else if (!showJournal && !showDialogue && document.activeElement?.closest("#journal, #dialogue")) {
      document.getElementById("stage").focus({ preventScroll: true });
    }
    journalWasOpen = showJournal;
    dialogueWasOpen = showDialogue;
  }
}

function quoteCard(entry) {
  const card = document.createElement("blockquote");
  card.className = "journal__quote";
  const who = document.createElement("span");
  who.className = "journal__who";
  who.textContent = entry.speaker;
  const text = document.createElement("p");
  text.textContent = entry.text;
  card.append(who, text);
  return card;
}
