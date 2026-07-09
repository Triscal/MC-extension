function showErrorBadge(message: string) {
  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setBadgeBackgroundColor({ color: "#c00" });
  chrome.storage.local.set({ lastError: message });
}

function clearBadge() {
  chrome.action.setBadgeText({ text: "" });
  chrome.storage.local.set({ lastError: null });
}

const TOAST_FUNC = async (message: string) => {
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

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
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
        "Only able to copy internal pages from the pop-up, click the Copy page title and URL button above.",
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
        func: writeToClipboardBackground,
        args: [md],
      })
      .then((results) => {
        const success = results?.[0]?.result;
        if (success) {
          clearBadge();
          chrome.scripting.executeScript({
            target: { tabId: tabNumber },
            func: TOAST_FUNC,
            args: ["✅ Copied!"],
          });
        } else {
          showErrorBadge(
            "Copy failed make sure you are not editing the web address.",
          );
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.error("MC* -", error.message);
        } else {
          console.error("MC* - unknown error: ", error);
        }
      });
  });
}

const writeToClipboardBackground = async (md: string) => {
  if (md) {
    try {
      await navigator.clipboard.writeText(md);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("MC* -", error.message);
      } else {
        console.error("MC* - unknown error: ", error);
      }
      return false;
    }
  }
  return true;
};
