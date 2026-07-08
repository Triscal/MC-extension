chrome.storage.local.get({ lastError: null }, ({ lastError }) => {
  if (lastError) {
    setMessage(`${lastError}`, true);
  } else {
    setMessage(`No recent errors.`, false);
  }
});

function setMessage(message: string, isError: Boolean) {
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
      content.innerHTML = `<p class="no-error">no recent errors</p>`;
      button.remove();
    };
    content.appendChild(button);
  } else {
    content.innerHTML = `<p class="no-error">${message}</p>`;
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

async function loadPatternsPopup(): Promise<string[]> {
  const rawPatterns = await chrome.storage.local.get("cleanupPatterns");
  if (Object.keys(rawPatterns).length !== 0) {
    const patternArray = rawPatterns.cleanupPatterns as string[];

    return patternArray;
  }

  return [];
}

copyButton.onclick = async () => {
  const listOfPatterns = await loadPatternsPopup();

  let md = "hi";

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    setMessage("started", false);
    if (!tab) return;

    const tabURL = tab.url ?? "";

    const tabNumber = tab.id ?? 0;

    let title = tab.title ?? "empty title";

    if (
      tabURL.startsWith("chrome://") ||
      tabURL.startsWith("chrome-extension://") ||
      tabURL.startsWith("about:")
    ) {
      setMessage(
        "Unable to copy browser settings and other internal pages",
        true,
      );
      return;
    }

    for (const pattern of listOfPatterns) {
      try {
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        title = title.replace(new RegExp(escaped + "\\s*$", "gi"), "").trim();
      } catch (e) {}
    }
    md = `[${title}](${tabURL})`;
    setMessage("✅ Copied!", false);
    writeToClipboard(md);
  });
};

async function writeToClipboard(md: string) {
  let failed = false;
  if (md) {
    try {
      await navigator.clipboard.writeText(md);
    } catch (e) {
      failed = true;
    }
  }

  if (failed) {
    setMessage("Writing to clipboard failed, please report a bug.", true);
  }
}
