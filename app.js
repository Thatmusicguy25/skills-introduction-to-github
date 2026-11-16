const $ = (selector) => document.querySelector(selector);
const storageKey = "shorts-studio-queue";
const schedule = {
  "YouTube Shorts": ["7:00 PM – 9:00 PM", "A strong starting window for evening viewers."],
  TikTok: ["6:00 PM – 10:00 PM", "Evening scrolling tends to create more discovery."],
  "Instagram Reels": ["11:00 AM – 1:00 PM", "Catch the midday check-in and lunch break audience."],
  "Facebook Reels": ["12:00 PM – 3:00 PM", "A useful window for daytime and weekend audiences."]
};

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).slice(0, 3).join("");
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

function generateKit(event) {
  event.preventDefault();
  const topic = $("#topic").value.trim();
  if (!topic) return;
  const audience = $("#audience").value;
  const tone = $("#tone").value.toLowerCase();
  const platform = $("#platform").value;
  const length = $("#length").value;
  const tag = slug(topic);
  $("#hook").textContent = `Stop scrolling: here’s the ${tone} way to understand ${topic}.`;
  $("#script").textContent = `0–3s: Start with the hook. 3–${Math.round(length * .75)}s: Show 3 practical takeaways about ${topic} for ${audience.toLowerCase()}, using one visual example per point. ${Math.round(length * .75)}–${length}s: Recap the best takeaway and invite viewers to save and follow for the next part.`;
  $("#caption").textContent = `Would you try this? Save this ${topic} guide and share it with someone who needs it. What should I cover next?`;
  $("#hashtags").innerHTML = ["#shorts", `#${tag}`, "#creator", "#tips", `#${platform.split(" ")[0].toLowerCase()}`]
    .map((tagName) => `<span class="hashtag">${tagName}</span>`).join("");
  $("#kit-title").textContent = `${topic} kit`;
  $("#kit-platform").textContent = platform;
  $("#empty-state").classList.add("hidden");
  $("#kit-results").classList.remove("hidden");
  $("#save-idea").dataset.topic = topic;
}

function readQueue() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
}

function renderQueue() {
  const queue = readQueue();
  $("#queue-count").textContent = queue.length;
  $("#clear-queue").classList.toggle("hidden", queue.length === 0);
  $("#queue").innerHTML = queue.length ? queue.map((item, index) =>
    `<div class="queue-item"><div><strong>${escapeHTML(item.topic)}</strong><small>${escapeHTML(item.platform)} · Saved idea</small></div><button class="remove-item" data-index="${index}" aria-label="Remove ${escapeHTML(item.topic)}">×</button></div>`
  ).join("") : '<p class="queue-empty">Your saved ideas will appear here.</p>';
}

$("#planner-form").addEventListener("submit", generateKit);
$("#save-idea").addEventListener("click", (event) => {
  const queue = readQueue();
  queue.unshift({ topic: event.currentTarget.dataset.topic, platform: $("#platform").value });
  localStorage.setItem(storageKey, JSON.stringify(queue.slice(0, 12)));
  renderQueue();
  event.currentTarget.textContent = "Saved to content queue ✓";
});
$("#queue").addEventListener("click", (event) => {
  if (!event.target.dataset.index) return;
  const queue = readQueue();
  queue.splice(Number(event.target.dataset.index), 1);
  localStorage.setItem(storageKey, JSON.stringify(queue));
  renderQueue();
});
$("#clear-queue").addEventListener("click", () => { localStorage.removeItem(storageKey); renderQueue(); });
$("#schedule-platform").addEventListener("change", (event) => {
  const [time, copy] = schedule[event.target.value];
  $("#recommended-time").textContent = time;
  $("#recommendation-copy").textContent = copy;
});
function updateRevenue() {
  const total = (Number($("#monthly-views").value || 0) / 1000) * Number($("#rpm").value || 0);
  $("#revenue-total").textContent = total.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
$("#monthly-views").addEventListener("input", updateRevenue);
$("#rpm").addEventListener("input", updateRevenue);
document.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
  const text = $(`#${button.dataset.copy}`).textContent;
  if (navigator.clipboard) await navigator.clipboard.writeText(text);
  button.textContent = "Copied!";
  setTimeout(() => { button.textContent = "Copy"; }, 1200);
}));
renderQueue();
