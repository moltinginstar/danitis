async function getActiveTabId() {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab.id;
}

async function toggleRebalance() {
  const { toggle } = await chrome.storage.sync.get("toggle");
  chrome.storage.sync.set({ toggle: !toggle });
}

async function rebalance() {
  try {
    const tabId = await getActiveTabId();
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["js/rebalancer.js"],
    });
  } catch (e) {
    console.error(tabId, e);
  }
}

async function unbalance() {
  try {
    const tabId = await getActiveTabId();
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["js/unbalancer.js"],
    });
  } catch (e) {
    console.error(tabId, e);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  const toggle = true;
  chrome.storage.sync.set({ toggle });

  chrome.action.onClicked.addListener(async () => {
    await toggleRebalance();
  });

  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "toggle") {
      await toggleRebalance();
    }
  });

  chrome.contextMenus.create({
    id: "rebalance",
    title: chrome.i18n.getMessage("toggle"),
    contexts: ["all"],
    type: "checkbox",
    checked: toggle,
  });
  chrome.contextMenus.onClicked.addListener(({ checked }) => {
    chrome.storage.sync.set({ toggle: checked });
  });

  chrome.storage.onChanged.addListener(async (changes) => {
    const { toggle } = changes;

    if (toggle != null && toggle.oldValue !== toggle.newValue) {
      if (toggle.newValue) {
        await rebalance();

        chrome.action.setIcon({
          path: {
            16: "img/icon16.png",
            32: "img/icon32.png",
          },
        });
      } else {
        await unbalance();

        chrome.action.setIcon({
          path: {
            16: "img/icon_disabled16.png",
            32: "img/icon_disabled32.png",
          },
        });
      }

      chrome.contextMenus.update("rebalance", { checked: toggle.newValue });
    }
  });

  const maybeRebalance = async () => {
    const { toggle } = await chrome.storage.sync.get("toggle");
    if (toggle) {
      await rebalance();
    }
  };
  chrome.tabs.onCreated.addListener(maybeRebalance);
  chrome.tabs.onUpdated.addListener(maybeRebalance);
});
