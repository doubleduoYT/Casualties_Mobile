const blocks = [...document.querySelectorAll(".markdown > h1, .markdown > h2, .markdown > p, .markdown > ul")];

function wrapTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const textNode of textNodes) {
    if (!textNode.nodeValue.trim()) continue;
    const fragment = document.createDocumentFragment();
    for (const part of textNode.nodeValue.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
      else {
        const word = document.createElement("span");
        word.className = "reveal-word";
        word.textContent = part;
        fragment.append(word);
      }
    }
    textNode.replaceWith(fragment);
  }
}

function setLineDelays(block) {
  const words = [...block.querySelectorAll(".reveal-word")];
  const lines = [];
  let previousTop = Number.NEGATIVE_INFINITY;
  for (const word of words) {
    const top = Math.round(word.getBoundingClientRect().top);
    if (Math.abs(top - previousTop) > 2) lines.push({top, count: 0});
    const line = lines.at(-1);
    word.style.setProperty("--line", String(lines.length - 1));
    word.style.setProperty("--word", String(line.count++));
    previousTop = top;
  }
}

for (const block of blocks) {
  wrapTextNodes(block);
  setLineDelays(block);
}
document.documentElement.classList.add("js-enabled");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, {threshold: 0.08, rootMargin: "0px 0px -5% 0px"});
  blocks.forEach((block) => observer.observe(block));
} else {
  blocks.forEach((block) => block.classList.add("is-visible"));
}

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => blocks.forEach(setLineDelays), 100);
});
