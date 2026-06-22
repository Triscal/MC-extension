const ids = [
  "patternList",
  "addbutton",
  "savebutton",
  "status",
  "shortcutButton",
];
const elements = ids.map((id) => document.getElementById(id));

if (elements.some((el) => el === null)) {
  throw new Error("Missing element");
}

const list = document.getElementById("patternList")!;
const addbutton = document.getElementById("addbutton")!;
const savebutton = document.getElementById("savebutton")!;
const saveStatus = document.getElementById("status")!;
const shortcutButton = document.getElementById("shortcutButton")!;

function addRow(value = "") {
  const row = document.createElement("div");
  row.className = "pattern-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "e.g.  - YouTube";
  input.value = value;

  const button = document.createElement("button");
  button.className = "remove-button";
  button.textContent = "×";
  button.title = "Remove";
  button.onclick = () => row.remove();

  row.appendChild(input);
  row.appendChild(button);
  list.appendChild(row);
  input.focus();
  return row;
}

async function loadPatterns() {
  const rawPatterns = await chrome.storage.local.get("cleanupPatterns");

  if (Object.keys(rawPatterns).length !== 0) {
    const patternArray = rawPatterns.cleanupPatterns as string[];

    patternArray.forEach((p) => addRow(p));
  }
  addRow();
}

loadPatterns();

addbutton.onclick = () => {
  addRow();
};

savebutton.onclick = () => {
  const patterns = [...list.querySelectorAll("input")]
    .map((i) => i.value.trim())
    .filter(Boolean);

  chrome.storage.local.set({ cleanupPatterns: patterns }, () => {
    saveStatus.textContent = "Saved!";
    setTimeout(() => (saveStatus.textContent = ""), 2000);
  });
};

shortcutButton.onclick = () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
};
