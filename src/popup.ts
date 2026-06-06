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
      chrome.action.setTitle({ title: "Copy as Markdown Link" });
      content.innerHTML = `<p class="no-error">No recent errors.</p>`;
      btn.remove();
    };
    content.appendChild(btn);
  } else {
    content.innerHTML = `<p class="no-error">No recent errors.</p>`;
  }
});

const button = document.getElementById("settingsBtn");

if (!button) throw new Error("Element not found");

button.onclick = () => {
  chrome.runtime.openOptionsPage();
};
