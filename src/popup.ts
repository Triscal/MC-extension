chrome.storage.local.get({ lastError: null }, ({ lastError }) => {

  if (lastError) {
    setMessage(`${lastError}`, true)
  } else {
    setMessage(`No recent errors.`, false);
  }
});

function setMessage(message:string, isError:Boolean) {
    const content = document.getElementById("content");
    if (!content) throw new Error("Element not found");
    if (isError) {
    content.innerHTML = `<div class="error-box">${message}</div>`;
    const button = document.createElement("button");
    button.className = "secondary-button";
    button.textContent = "Clear";
    button.onclick = () => {
      chrome.storage.local.set({ lastError: null });
      chrome.action.setBadgeText({ text: "" });
      chrome.action.setTitle({ title: "MC* - Markdown Copy" });
      content.innerHTML = `<p class="no-error">No recent errors.</p>`;
      button.remove();
    };
    content.appendChild(button);
  } else {
    content.innerHTML = `<p class="no-error">No recent errors.</p>`;
  }
}

const settingsButton = document.getElementById("settingsButton");

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

const shortcutSettingButton = document.getElementById("shortcutButton");

if (!shortcutSettingButton) throw new Error("Element not found");

shortcutSettingButton.onclick = () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
};

const copyButton = document.getElementById("copyButton");

if (!copyButton) throw new Error("Element not found");

copyButton.onclick = () => {
  window.close()
  chrome.runtime.sendMessage({action: "copyURLandTitle"}, (response) => {
});
};


