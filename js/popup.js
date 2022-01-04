document.querySelectorAll("[data-text]").forEach(e => {
  e.innerText = chrome.i18n.getMessage(e.dataset.text)
});

document.getElementById("context-menu").addEventListener("click", event => {
  chrome.storage.local.set({ rebalanceToggle: event.target.checked });
});
