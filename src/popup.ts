chrome.storage.local.get({ lastError: null }, ({ lastError }) => {
  const content = document.getElementById("content");
  if (!content) throw new Error("Element not found");

  if (lastError) {
    content.innerHTML = `<div class="error-box">${lastError}</div>`;
    const btn = document.createElement("button");
    btn.className = "clear-btn";
    btn.textContent = "Clear";
    btn.onclick = () => {
      chrome.storage.local.set({ lastError: null });
      chrome.action.setBadgeText({ text: "" });
      chrome.action.setTitle({ title: "MC* - Markdown Copy" });
      content.innerHTML = `<p class="no-error">No recent errors.</p>`;
      btn.remove();
    };
    content.appendChild(btn);
  } else {
    content.innerHTML = `<p class="no-error">No recent errors.</p>`;
  }
});

const settingsButton = document.getElementById("settingsBtn");

if (!settingsButton) throw new Error("Element not found");

settingsButton.onclick = () => {
  chrome.runtime.openOptionsPage();
};

chrome.commands.getAll((commands) => {
  const cmd = commands.find((c) => c.name === "copy-markdown");
  const hasShortcut = cmd && cmd.shortcut;
  const setup = document.getElementById("setup");
  if (!setup) return;
  setup.style.display = hasShortcut ? "none" : "block";
});

const shortcutSettingButton = document.getElementById("shortcutBtn");

if (!shortcutSettingButton) throw new Error("Element not found");

shortcutSettingButton.onclick = () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
};
