function getAllTextNodes() {
  const result = [];

  (function scanSubTree(node) {
    if (node.childNodes.length) {
      for (let i = 0; i < node.childNodes.length; i++) {
        scanSubTree(node.childNodes[i]);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      result.push(node);
    }
  })(document);

  return result;
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1);
}

function quote(str) {
  return (str + "").replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

function replaceTextOnPage(from, to, tabId) {
  const originalText = [];

  getAllTextNodes().forEach(node => {
    originalText.push(node.nodeValue);
    node.nodeValue = node.nodeValue.replace(new RegExp(quote(from), "g"), to);
  });

  if (tabId) {
    chrome.storage.local.set({ [tabId.toString()]: originalText });
  }
}

chrome.storage.local.get("tabId", ({ tabId }) => {
  chrome.storage.sync.get("replacementKey", ({ replacementKey }) => {
    const pattern = "Danish";
    const replacement = capitalize(chrome.i18n.getMessage(replacementKey));

    replaceTextOnPage(pattern, replacement, tabId);
  });
});
