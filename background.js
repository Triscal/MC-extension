function showErrorBadge(message) {
  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setBadgeBackgroundColor({ color: "#c00" });
  chrome.action.setTitle({ title: message });
  chrome.storage.local.set({ lastError: message });
}

function clearBadge() {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setTitle({ title: "Copy as Markdown Link" });
  chrome.storage.local.set({ lastError: null });
}

const TOAST_FUNC = async (text, message, isError) => {
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
    position: fixed; bottom: 24px;
    left: 50%; transform: translateX(-50%);
    background: ${isError ? "#c00" : isDark ? "#fff" : "#333"};
    color: ${isError ? "#fff" : isDark ? "#333" : "#fff"};
    padding: 10px 18px; border-radius: 8px;
    font-size: 14px; font-family: sans-serif;
    z-index: 999999; opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
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

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) return;

    if (
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://") ||
      tab.url.startsWith("about:")
    ) {
      return;
    }

    chrome.storage.sync.get({ cleanupPatterns: [] }, ({ cleanupPatterns }) => {
      let title = tab.title;
      for (const pattern of cleanupPatterns) {
        try {
          const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          title = title.replace(new RegExp(escaped + "\\s*$", "gi"), "").trim();
        } catch (e) {}
      }
      const md = `[${title}](${tab.url})`;

      chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: TOAST_FUNC,
      args: [md, "Copied!", false]
          }).then((results) => {
        const success = results?.[0]?.result;
        if (!success) {
          console.log("showing error")
          showErrorBadge("⚠ Can't copy while the URL bar is active.");
        } else {
          console.log("no error")
          clearBadge();
        }
      }).catch(() => {
        showErrorBadge("⚠ Can't copy while the URL bar is active.");
      });
    });
  });
});