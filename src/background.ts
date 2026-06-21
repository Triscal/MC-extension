function showErrorBadge(message: string) {
  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setBadgeBackgroundColor({ color: "#c00" });
  chrome.action.setTitle({ title: message });
  chrome.storage.local.set({ lastError: message });
}

function clearBadge() {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setTitle({ title: "MC* - Markdown Copy" });
  chrome.storage.local.set({ lastError: null });
}

const TOAST_FUNC = async (text: string, message: string) => {
  let failed = false;
  if (text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      failed = true;
    }
  }

  if (failed) return false;

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const existing = document.getElementById("__md-copy-toast__");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "__md-copy-toast__";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; top: 24px;
    left: 50%; transform: translateX(-50%);
    background: ${isDark ? "#fff" : "#333"};
    color: ${isDark ? "#333" : "#fff"};
    padding: 10px 18px; border-radius: 8px;
    font-size: 14px; font-family: sans-serif;
    z-index: 999999; opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
    border: 1px solid ${isDark ? "#333" : "#000"};
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 200);
    }, 1500);
  });

  return true;
};

chrome.commands.onCommand.addListener((command) => {
  if (command !== "copy-markdown") return;

  copyURLandTitle();
});

async function loadPatternsAsync(): Promise<string[]> {
  const rawPatterns = await chrome.storage.local.get("cleanupPatterns");
  if (rawPatterns !== undefined) {
    const patternArray = rawPatterns.cleanupPatterns as string[];

    return patternArray;
  }

  return [];
}

async function copyURLandTitle() {
  const listOfPatterns = await loadPatternsAsync();

  console.log(listOfPatterns);

  let title = "empty title";

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) return;

    const tabURL = tab.url ?? "";

    const tabNumber = tab.id ?? 0;

    if (
      tabURL.startsWith("chrome://") ||
      tabURL.startsWith("chrome-extension://") ||
      tabURL.startsWith("about:")
    ) {
      showErrorBadge(
        "Unable to copy browser settings and other internal pages",
      );
      return;
    }
    // cast to your type

    for (const pattern of listOfPatterns) {
      try {
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        title = title.replace(new RegExp(escaped + "\\s*$", "gi"), "").trim();
      } catch (e) {}
    }
    const md = `[${title}](${tabURL})`;

    chrome.scripting
      .executeScript({
        target: { tabId: tabNumber },
        func: TOAST_FUNC,
        args: [md, "✅ Copied!"],
      })
      .then((results) => {
        const success = results?.[0]?.result;
        if (!success) {
          showErrorBadge("⚠️ Can't copy while the URL bar is active.");
        } else {
          clearBadge();
        }
      })
      .catch(() => {
        showErrorBadge("⚠️ Can't copy while the URL bar is active.");
      });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "copyURLandTitle") {
    const result = copyURLandTitle();
  }
});
