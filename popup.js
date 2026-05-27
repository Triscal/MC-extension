chrome.storage.local.get({ lastError: null }, ({ lastError }) => {
  const content = document.getElementById("content");

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

document.getElementById("settingsBtn").onclick = () => {
  chrome.runtime.openOptionsPage();
};