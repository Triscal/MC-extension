const list   = document.getElementById("patternList");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

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
  list.appendChild(input.focus ? (list.appendChild(row), row) : row);
  list.appendChild(row);  // ensure appended
  input.focus();
  return row;
}

// Load saved patterns
chrome.storage.sync.get({ cleanupPatterns: [] }, ({ cleanupPatterns }) => {
  if (cleanupPatterns.length === 0) {
    addRow();
  } else {
    cleanupPatterns.forEach(p => addRow(p));
  }
});

addBtn.addEventListener("click", () => addRow());

saveBtn.addEventListener("click", () => {
  const patterns = [...list.querySelectorAll("input")]
    .map(i => i.value.trim())
    .filter(Boolean);

  chrome.storage.sync.set({ cleanupPatterns: patterns }, () => {
    status.textContent = "Saved!";
    setTimeout(() => status.textContent = "", 2000);
  });
});