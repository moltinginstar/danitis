function rebalance(replacementPattern, replacementString, node) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.nodeValue = node.nodeValue.replace(
      replacementPattern,
      replacementString
    );
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    node.childNodes.forEach((node) => {
      rebalance(replacementPattern, replacementString, node)
    });
  }
}

rebalance(
  new RegExp(`\\b${chrome.i18n.getMessage("stringToReplace")}\\b`, "g"),
  chrome.i18n.getMessage("replacementString"),
  document.body,
);
