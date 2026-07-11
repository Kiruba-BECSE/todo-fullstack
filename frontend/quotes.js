const QUOTES = [
  { text: "Small steps every day lead to big changes.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "One task at a time builds unstoppable momentum.", author: "Unknown" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Momentum solves 90% of your problems.", author: "Unknown" }
];

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function renderQuoteInto(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const q = getRandomQuote();
  el.innerHTML = `<span class="q-mark">"</span>${q.text}<span class="q-mark">"</span> <br><span style="opacity:0.7">— ${q.author}</span>`;
}