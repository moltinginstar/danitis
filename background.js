async function getActiveTabId() {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab.id;
}

async function rebalance() {
  const tabId = await getActiveTabId();
  chrome.storage.local.set({ tabId });

  chrome.scripting.executeScript({
    target: { tabId },
    files: ["js/rebalancer.js"],
  }, res => {
    const e = chrome.runtime.lastError;
    if (e !== undefined) {
      console.log(tabId, res, e);
    }
  });
}

async function unbalance() {
  const tabId = await getActiveTabId();
  chrome.storage.local.set({ tabId });

  chrome.scripting.executeScript({
    target: { tabId },
    files: ["js/unbalancer.js"],
  }, res => {
    const e = chrome.runtime.lastError;
    if (e !== undefined) {
      console.log(tabId, res, e);
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ replacementKey: "replacementThroatInflammation" }); // TODO

  const toggle = true;
  chrome.storage.local.set({ toggle });

  chrome.contextMenus.create({
    id: "rebalance",
    title: "Rebalance universe",
    contexts: ["all"],
    type: "checkbox",
    checked: toggle,
  });
  chrome.contextMenus.onClicked.addListener(info => {
    chrome.storage.local.set({ toggle: info.checked });
  });

  // `getMessage` currently not supported in service workers
  chrome.runtime.onMessage.addListener(request => {
    chrome.contextMenus.update("rebalance", { title: request.title });
  });

  chrome.commands.onCommand.addListener(command => {
    if (command === "toggleRebalance") {
      chrome.storage.local.get("toggle", ({ toggle }) => {
        chrome.storage.local.set({ toggle: !toggle });
      });
    }
  });

  chrome.storage.onChanged.addListener(async changes => {
    const { toggle, rebalanceToggle } = changes;

    if (toggle !== undefined && toggle?.oldValue !== toggle?.newValue) {
      if (toggle?.newValue) {
        await rebalance();

        chrome.action.setIcon({
          path: {
            "16": "img/icon16.png",
            "32": "img/icon32.png",
          },
        });
      } else {
        await unbalance();

        chrome.action.setIcon({
          path: {
            "16": "img/icon_disabled16.png",
            "32": "img/icon_disabled32.png",
          },
        });
      }
    }

    // TODO: two-way binding
    if (rebalanceToggle !== undefined && rebalanceToggle?.oldValue !== rebalanceToggle?.newValue) {
      chrome.storage.local.set({ toggle: rebalanceToggle?.newValue });
      chrome.contextMenus.update("rebalance", { checked: rebalanceToggle?.newValue });
    }
  });

  chrome.tabs.onUpdated.addListener(async () => {
    const tabId = await getActiveTabId();
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["js/localizeContextMenu.js"],
    });

    chrome.storage.local.get("toggle", async ({ toggle }) => {
      if (toggle) {
        await rebalance();
      }
    });
  })
});
