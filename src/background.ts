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
  const host = document.createElement("div");
  host.style.cssText = `
    position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
    z-index: 2147483647;
  `;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      .toast {
        background: ${isDark ? "#fff" : "#333"};
        color: ${isDark ? "#333" : "#fff"};
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 14px;
        font-family: sans-serif;
        border: 1px solid ${isDark ? "#333" : "#000"};
        opacity: 0;
        transition: opacity 0.15s ease;
        pointer-events: none;
      }
      .toast.show { opacity: 1; }
    </style>
    <div class="toast">${message}</div>
  `;

  const toastEl = shadow.querySelector(".toast")!;
  requestAnimationFrame(() => toastEl.classList.add("show"));

  setTimeout(() => {
    toastEl.classList.remove("show");
    toastEl.addEventListener("transitionend", () => host.remove(), {
      once: true,
    });
  }, 1500);

  return true;
};

chrome.commands.onCommand.addListener((command) => {
  if (command !== "copy-markdown") return;

  copyURLandTitle();
});

async function loadPatternsAsync(): Promise<string[]> {
  const rawPatterns = await chrome.storage.local.get("cleanupPatterns");
  if (Object.keys(rawPatterns).length !== 0) {
    const patternArray = rawPatterns.cleanupPatterns as string[];

    return patternArray;
  }

  return [];
}

async function copyURLandTitle() {
  const listOfPatterns = await loadPatternsAsync();

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) return;

    const tabURL = tab.url ?? "";

    const tabNumber = tab.id ?? 0;

    let title = tab.title ?? "empty title";

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
          showErrorBadge(
            "⚠️ Can't copy while the web address is being edited. Please click somewhere on the page and try again.",
          );
        } else {
          clearBadge();
        }
      })
      .catch(() => {
        showErrorBadge(
          "⚠️ Can't copy while the web address is being edited. Please click somewhere on the page and try again.",
        );
      });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "copyURLandTitle") {
    const result = copyURLandTitle();
  }
});
