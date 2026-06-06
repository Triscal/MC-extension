const ids = ["patternList", "addBtn", "saveBtn", "status"];
const els = ids.map(id => document.getElementById(id));

if (els.some(el => el === null)) {
  throw new Error("Missing element");
}

const list   = document.getElementById("patternList")!;
const addBtn = document.getElementById("addBtn")!;
const saveBtn = document.getElementById("saveBtn")!;
const saveStatus = document.getElementById("status")!;


function addRow(value = "") {
  const row = document.createElement("div");
  row.className = "pattern-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = 'e.g.  - YouTube';
  input.value = value;

  const btn = document.createElement("button");
  btn.className = "remove-btn";
  btn.textContent = "×";
  btn.title = "Remove";
  btn.onclick = () => row.remove();

  row.appendChild(input);
  row.appendChild(btn);
  list.appendChild(row);
  input.focus();
  return row;
}

// Load saved patterns
chrome.storage.sync.get({ cleanupPatterns: [] }, ({ rawCleanupPatterns }) => {
   const listOfPatterns = rawCleanupPatterns as string[]; // cast to your type
  if (listOfPatterns === undefined) {
    addRow();
  } else {
    listOfPatterns.forEach(p => addRow(p));
  }
});

addBtn.addEventListener("click", () => addRow());

saveBtn.addEventListener("click", () => {
  const patterns = [...list.querySelectorAll("input")]
    .map(i => i.value.trim())
    .filter(Boolean);

  chrome.storage.sync.set({ cleanupPatterns: patterns }, () => {
    saveStatus.textContent = "Saved!";
    setTimeout(() => saveStatus.textContent = "", 2000);
  });
});