const STORAGE_KEY = "daily-knowledge-v1";
const DEFAULT_STATE = {
  topics: ["economics", "art", "science"],
  completed: {},
  saved: [],
  quizAnswers: {},
  discoveredCards: [],
  dailyCardIds: {},
  discoveryIndex: 0,
  completionLog: {},
  onboardingSeen: false
};
let state = loadState();
let currentFilter = "all";
let activeDialogCardId = null;
let toastTimer;
let dailyLoading = false;
let discoveryLoading = false;

function loadState() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_STATE));
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const topics = Array.isArray(stored.topics) ? [...new Set(stored.topics)].filter(id => TOPICS[id]) : defaults.topics;
    const completed = Object.fromEntries(Object.entries(object(stored.completed)).filter(([, date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)));
    const completionLog = object(stored.completionLog);
    for (const [date, ids] of Object.entries(completionLog)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(ids)) delete completionLog[date];
      else completionLog[date] = [...new Set(ids.filter(id => typeof id === "string"))];
    }
    for (const [id, date] of Object.entries(completed)) completionLog[date] = [...new Set([...(completionLog[date] || []), id])];
    return { ...defaults, topics: topics.length ? topics : defaults.topics, completed, completionLog,
      saved: Array.isArray(stored.saved) ? [...new Set(stored.saved.filter(id => typeof id === "string"))] : [],
      quizAnswers: object(stored.quizAnswers), dailyCardIds: object(stored.dailyCardIds),
      discoveredCards: Array.isArray(stored.discoveredCards) ? stored.discoveredCards.filter(card => card && TOPICS[card.topic] && typeof card.id === "string" && typeof card.title === "string" && safeUrl(card.sourceUrl)) : [],
      discoveryIndex: Number.isSafeInteger(stored.discoveryIndex) ? stored.discoveryIndex : 0,
      onboardingSeen: stored.onboardingSeen === true };
  } catch { return defaults; }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { showToast("Your browser could not save progress. Free some space or allow site storage."); }
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayNumber(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function allCards() {
  return [...new Map([...state.discoveredCards, ...CARDS].map(card => [card.id, card])).values()];
}

function findCard(id) {
  return allCards().find(card => card.id === id);
}

function filteredCards() {
  const topics = state.topics.length ? state.topics : DEFAULT_STATE.topics;
  return allCards().filter(card => topics.includes(card.topic));
}

function todaysCards() {
  const ids = state.dailyCardIds[dateKey()] || {};
  return state.topics.map(topicId => findCard(ids[topicId])).filter(Boolean);
}

function fallbackCard(topicId, topicIndex = 0) {
  const list = CARDS.filter(card => card.topic === topicId);
  const seed = dayNumber() + new Date().getUTCFullYear() * 17 + topicIndex * 3;
  return list[seed % list.length];
}

function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]+/g) || [text]).map(sentence => sentence.trim()).filter(Boolean);
}

async function fetchKnowledgeCard(topicId, offsetSeed) {
  const topic = TOPICS[topicId];
  const queryIndex = Math.abs(offsetSeed) % topic.search.length;
  const resultOffset = Math.floor(Math.abs(offsetSeed) / topic.search.length) % 200;
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: topic.search[queryIndex],
    gsrnamespace: "0",
    gsrlimit: "1",
    gsroffset: String(resultOffset),
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "7",
    inprop: "url",
    redirects: "1",
    origin: "*",
    format: "json"
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, { signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw new Error("Knowledge source unavailable");
  const data = await response.json();
  const page = Object.values(data?.query?.pages || {})[0];
  if (!page?.extract || page.extract.length < 120) throw new Error("No suitable article found");
  if (/^(List|Outline|Index) of /i.test(page.title) || /may refer to:/i.test(page.extract.slice(0, 180))) throw new Error("Reference page skipped");
  const sentences = splitSentences(page.extract);
  const hook = sentences[0] || page.extract.slice(0, 220);
  const concept = sentences.slice(1, 4).join(" ") || sentences[0];
  const context = sentences.slice(4, 7).join(" ") || `This idea belongs to the wider study of ${topic.label.toLowerCase()} and connects to many related questions.`;
  return {
    id: `source-${topicId}-${page.pageid}`,
    topic: topicId,
    title: page.title,
    hook,
    concept,
    example: context,
    takeaway: `Close the card and explain ${page.title} in one clear sentence. If you can do that, the idea is already becoming yours.`,
    sourceName: "Wikipedia",
    sourceUrl: page.fullurl,
    discovered: true
  };
}

function addDiscoveredCard(card) {
  if (!card?.discovered) return;
  const existingIndex = state.discoveredCards.findIndex(item => item.id === card.id);
  if (existingIndex >= 0) state.discoveredCards[existingIndex] = card;
  else state.discoveredCards.unshift(card);
}

function pickDailyCard(topicId) {
  const list = CARDS.filter(card => card.topic === topicId);
  const history = Object.entries(state.dailyCardIds).filter(([day]) => day < dateKey()).sort(([a], [b]) => a.localeCompare(b));
  const lastSeen = new Map();
  for (const [day, ids] of history) if (ids?.[topicId]) lastSeen.set(ids[topicId], day);
  const fresh = list.filter(card => !lastSeen.has(card.id) && !state.completed[card.id]);
  if (fresh.length) return fresh[0];
  return [...list].sort((a, b) => (lastSeen.get(a.id) || state.completed[a.id] || "").localeCompare(lastSeen.get(b.id) || state.completed[b.id] || ""))[0];
}

function ensureDailyCards() {
  const today = dateKey();
  if (!state.dailyCardIds[today] || typeof state.dailyCardIds[today] !== "object") state.dailyCardIds[today] = {};
  for (const topicId of state.topics) {
    const existing = findCard(state.dailyCardIds[today][topicId]);
    if (!existing || existing.topic !== topicId || (existing.discovered && !isCompleteToday(existing.id))) {
      const next = pickDailyCard(topicId);
      state.dailyCardIds[today][topicId] = next.id;
      delete state.quizAnswers[next.id];
    }
  }
  saveState();
  renderAll();
}

async function discoverFreshCard() {
  if (discoveryLoading || !state.topics.length) return;
  discoveryLoading = true;
  const button = document.querySelector("#discover-button");
  button.disabled = true;
  button.textContent = "Finding something useful…";
  const topicId = currentFilter !== "all" ? currentFilter : state.topics[state.discoveryIndex % state.topics.length];
  let card = null;
  try {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const candidate = await fetchKnowledgeCard(topicId, dayNumber() * 17 + (state.discoveryIndex + attempt) * 29);
        if (!findCard(candidate.id)) { card = candidate; break; }
      } catch { /* Try another result before using the offline fallback. */ }
    }
    if (!card) throw new Error("No fresh card found");
    state.discoveryIndex += 1;
    addDiscoveredCard(card);
    saveState();
    renderLibrary();
    openCard(card.id);
    showToast(`A new ${TOPICS[topicId].label} idea was added`);
  } catch {
    showToast("No new source preview found. Your written cards are still available offline.");
  } finally {
    discoveryLoading = false;
    button.disabled = false;
    button.textContent = "Explore a source preview";
  }
}

function isCompleteToday(id) { return (state.completionLog[dateKey()] || []).includes(id); }

function isComplete(id) { return Boolean(state.completed[id]); }
function isSaved(id) { return state.saved.includes(id); }

function quizMarkup(card) {
  const quiz = QUIZZES[card.id];
  if (!quiz) {
    const revealed = state.quizAnswers[card.id] === "recalled";
    return `
      <section class="quiz-box recall-box ${revealed ? "answered" : ""}">
        <div class="quiz-heading"><span>Memory check</span><strong>Pause before you reveal.</strong></div>
        <p class="quiz-question">How would you explain “${escapeHtml(card.title)}” in one sentence?</p>
        ${revealed
          ? `<div class="quiz-feedback correct"><strong>Memory cue ✦</strong><p>${escapeHtml(card.hook)}</p></div>`
          : `<button class="recall-button" type="button" data-recall="${escapeHtml(card.id)}">I have my answer — reveal the cue</button>`}
      </section>`;
  }
  const hasAnswer = Object.prototype.hasOwnProperty.call(state.quizAnswers, card.id);
  const selected = state.quizAnswers[card.id];
  const isCorrect = hasAnswer && selected === quiz.answer;
  const options = quiz.options.map((option, index) => {
    const classes = ["quiz-option"];
    if (hasAnswer && index === quiz.answer) classes.push("correct");
    if (hasAnswer && index === selected && index !== quiz.answer) classes.push("incorrect");
    return `<button class="${classes.join(" ")}" type="button" data-quiz-card="${escapeHtml(card.id)}" data-quiz-choice="${index}" ${hasAnswer ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`;
  }).join("");
  return `
    <section class="quiz-box ${hasAnswer ? "answered" : ""}">
      <div class="quiz-heading"><span>Quick check</span><strong>One tap. Make it stick.</strong></div>
      <p class="quiz-question">${escapeHtml(quiz.question)}</p>
      <div class="quiz-options">${options}</div>
      ${hasAnswer ? `<div class="quiz-feedback ${isCorrect ? "correct" : "incorrect"}"><strong>${isCorrect ? "That’s it ✦" : "Let’s check the explanation."}</strong><p>${escapeHtml(quiz.feedback)}</p>${!isCorrect ? `<button type="button" data-quiz-reset="${escapeHtml(card.id)}">Try again</button>` : ""}</div>` : ""}
    </section>`;
}

function cardMarkup(card, { dialog = false } = {}) {
  const topic = TOPICS[card.topic];
  const complete = isCompleteToday(card.id);
  const saved = isSaved(card.id);
  const sourceUrl = safeUrl(card.sourceUrl);
  return `
    <article class="learning-card" style="--accent:${topic.accent};--tag-bg:${topic.soft};--concept-bg:${topic.concept}">
      <div class="card-inner">
        <div class="card-topline">
          <span class="topic-tag"><span class="topic-dot"></span>${escapeHtml(topic.label)}</span>
          <span class="read-time">2 min read</span>
        </div>
        <h2 class="card-title">${escapeHtml(card.title)}</h2>
        <p class="card-hook">${escapeHtml(card.hook)}</p>
        <div class="concept-box"><strong>The idea</strong><p>${escapeHtml(card.concept)}</p></div>
        <div class="why-row">
          <div><span>${card.discovered ? "In context" : "In real life"}</span><p>${escapeHtml(card.example)}</p></div>
          <div><span>Make it stick</span><p>${escapeHtml(card.takeaway)}</p></div>
        </div>
        ${sourceUrl ? `<a class="source-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Source: ${escapeHtml(card.sourceName || "Read more")} ↗</a>${card.discovered ? `<p class="source-attribution">Excerpt adapted from Wikipedia · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>. This is a source preview, not a reviewed learning card.</p>` : ""}` : ""}
        ${!card.discovered ? `<p class="source-attribution">Explanation and illustrative examples by One Card Wiser. Source linked for further reading.</p>` : ""}
        ${quizMarkup(card)}
        <div class="card-actions">
          <button class="primary-button ${complete ? "completed" : ""}" type="button" data-complete="${escapeHtml(card.id)}">${complete ? "✓ Completed" : "Mark as complete"}</button>
          <button class="secondary-button ${saved ? "saved" : ""}" type="button" data-save="${escapeHtml(card.id)}">${saved ? "★ Saved" : "☆ Save for later"}</button>
          <button class="secondary-button" type="button" data-share="${escapeHtml(card.id)}">Share idea ↗</button>
          <button class="secondary-button" type="button" data-download="${escapeHtml(card.id)}">Download story ↓</button>
        </div>
      </div>
    </article>`;
}

function dailyCardMarkup(card, index) {
  const topic = TOPICS[card.topic];
  const complete = isCompleteToday(card.id);
  return `
    <button class="daily-topic-card ${complete ? "complete" : ""}" type="button" data-open-card="${escapeHtml(card.id)}" style="--accent:${topic.accent};--tag-bg:${topic.soft};--concept-bg:${topic.concept}">
      <span class="daily-card-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="topic-symbol daily-symbol" style="--symbol-bg:${topic.soft}">${escapeHtml(topic.symbol)}</span>
      <span class="topic-tag"><span class="topic-dot"></span>${escapeHtml(topic.label)}</span>
      <strong>${escapeHtml(card.title)}</strong>
      <span class="daily-card-hook">${escapeHtml(card.hook)}</span>
      <span class="daily-card-action">${complete ? "Learned today ✓" : "Open card →"}</span>
    </button>`;
}

function miniCardMarkup(card) {
  const topic = TOPICS[card.topic];
  return `
    <button class="mini-card" type="button" data-open-card="${escapeHtml(card.id)}" style="--accent:${topic.accent};--tag-bg:${topic.soft}">
      <span class="topic-tag"><span class="topic-dot"></span>${escapeHtml(topic.label)}</span>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.hook)}</p>
      <span class="mini-meta"><span>${card.discovered ? "Source preview" : "Written card"}</span><span class="mini-state">${isComplete(card.id) ? "✓ Learned" : isSaved(card.id) ? "★ Saved" : "Read →"}</span></span>
    </button>`;
}

function dailySkeletonMarkup(topicId, index) {
  const topic = TOPICS[topicId];
  return `
    <div class="daily-topic-card daily-skeleton" style="--accent:${topic.accent};--tag-bg:${topic.soft}">
      <span class="daily-card-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="topic-symbol daily-symbol" style="--symbol-bg:${topic.soft}">${escapeHtml(topic.symbol)}</span>
      <span class="topic-tag"><span class="topic-dot"></span>${escapeHtml(topic.label)}</span>
      <span class="skeleton-line wide"></span><span class="skeleton-line"></span><span class="skeleton-line short"></span>
      <span class="daily-card-action">Finding today’s idea…</span>
    </div>`;
}

function renderToday() {
  const date = new Date();
  const todayIds = state.dailyCardIds[dateKey()] || {};
  const slots = state.topics.map(topicId => ({ topicId, card: findCard(todayIds[topicId]) }));
  const cards = slots.map(slot => slot.card).filter(Boolean);
  const completed = cards.filter(card => isCompleteToday(card.id)).length;
  const total = state.topics.length;
  const allDone = total > 0 && cards.length === total && completed === total;
  document.querySelector("#today-date").textContent = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  document.querySelector("#today-heading").textContent = total === 3 ? "Your daily three" : "Your daily set";
  document.querySelector("#daily-deck").innerHTML = slots.map((slot, index) => slot.card ? dailyCardMarkup(slot.card, index) : dailySkeletonMarkup(slot.topicId, index)).join("");
  document.querySelector("#daily-progress-label").textContent = `${completed} / ${total}`;
  document.querySelector("#daily-progress-message").textContent = dailyLoading && cards.length < total ? "Curating today’s fresh ideas…" : allDone ? "Today’s set complete. Make room for tomorrow." : completed ? "Keep going—finish today’s set." : `Today’s challenge: master ${total} ${total === 1 ? "idea" : "ideas"}.`;
  document.querySelector("#daily-progress-fill").style.width = `${total ? (completed / total) * 100 : 0}%`;
  document.querySelector("#daily-progress").classList.toggle("complete", allDone);
  document.querySelector("#streak-count").textContent = calculateStreak();
}

function calculateStreak() {
  const completedDates = new Set(Object.entries(state.completionLog).filter(([, ids]) => ids.length).map(([date]) => date));
  let streak = 0;
  const cursor = new Date();
  if (!completedDates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (completedDates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderFilters() {
  const available = ["all", ...state.topics];
  if (!available.includes(currentFilter)) currentFilter = "all";
  document.querySelector("#library-filters").innerHTML = available.map(topic => {
    const label = topic === "all" ? "All topics" : TOPICS[topic].label;
    return `<button class="filter-button ${currentFilter === topic ? "active" : ""}" type="button" data-filter="${topic}">${label}</button>`;
  }).join("");
}

function renderLibrary() {
  const list = filteredCards().filter(card => currentFilter === "all" || card.topic === currentFilter);
  document.querySelector("#library-count").textContent = `${list.length} ideas`;
  document.querySelector("#library-grid").innerHTML = list.map(miniCardMarkup).join("");
}

function renderSaved() {
  const list = state.saved.map(findCard).filter(Boolean);
  document.querySelector("#saved-count").textContent = `${list.length} saved`;
  document.querySelector("#saved-grid").innerHTML = list.length ? list.map(miniCardMarkup).join("") : `
    <div class="empty-state"><h3>Your collection is waiting</h3><p>Save an idea you want to remember, revisit, or put into practice.</p></div>`;
}

function renderTopicOptions() {
  document.querySelector("#topic-options").innerHTML = Object.entries(TOPICS).map(([id, topic]) => `
    <label class="topic-option">
      <input type="checkbox" name="topic" value="${id}" ${state.topics.includes(id) ? "checked" : ""}>
      <span class="topic-choice">
        <span class="topic-symbol" style="--symbol-bg:${topic.soft}">${topic.symbol}</span>
        <span class="topic-copy"><strong>${topic.label}</strong><small>${topic.subtitle}</small></span>
        <span class="topic-check" aria-hidden="true"></span>
      </span>
    </label>`).join("");
}

function renderAll() {
  renderWeeklyProgress(); renderToday(); renderFilters(); renderLibrary(); renderSaved(); renderTopicOptions();
  if (activeDialogCardId && document.querySelector("#card-dialog").open) {
    const card = findCard(activeDialogCardId);
    if (card) document.querySelector("#dialog-card").innerHTML = cardMarkup(card);
  }
}

function showView(name) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === `${name}-view`));
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.viewLink === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openCard(id) {
  const card = findCard(id);
  if (!card) return;
  trackEvent("card_open", { topic: card.topic, kind: card.discovered ? "source_preview" : "written" });
  activeDialogCardId = id;
  document.querySelector("#dialog-card").innerHTML = cardMarkup(card, { dialog: true });
  document.querySelector("#card-dialog").showModal();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.addEventListener("click", event => {
  const share = event.target.closest("[data-share]");
  if (share) shareCard(share.dataset.share);
  const download = event.target.closest("[data-download]");
  if (download) downloadStory(download.dataset.download);

  const viewLink = event.target.closest("[data-view-link]");
  if (viewLink) showView(viewLink.dataset.viewLink);

  const completeButton = event.target.closest("[data-complete]");
  if (completeButton) {
    const id = completeButton.dataset.complete;
    const completing = !isCompleteToday(id);
    const today = dateKey();
    if (!completing) {
      state.completionLog[today] = (state.completionLog[today] || []).filter(item => item !== id);
      const previous = Object.keys(state.completionLog).sort().reverse().find(day => state.completionLog[day].includes(id));
      if (previous) state.completed[id] = previous; else delete state.completed[id];
    } else {
      state.completed[id] = today;
      state.completionLog[today] = [...new Set([...(state.completionLog[today] || []), id])];
      trackEvent("card_complete", { topic: findCard(id)?.topic });
    }
    saveState(); renderAll();
    const dailyIds = todaysCards().map(card => card.id);
    const dailySetComplete = dailyIds.includes(id) && dailyIds.length === state.topics.length && dailyIds.every(cardId => isCompleteToday(cardId));
    showToast(!completing ? "Marked as not completed" : dailySetComplete ? "Daily set complete — brilliant work ✦" : "One down. Keep your curiosity moving.");
  }

  const quizChoice = event.target.closest("[data-quiz-choice]");
  if (quizChoice) {
    const id = quizChoice.dataset.quizCard;
    const choice = Number(quizChoice.dataset.quizChoice);
    trackEvent("quiz_answer", { topic: findCard(id)?.topic, correct: choice === QUIZZES[id].answer });
    state.quizAnswers[id] = choice;
    saveState(); renderAll();
    if (choice === QUIZZES[id].answer) showToast("Correct — that idea is yours now.");
  }

  const recallButton = event.target.closest("[data-recall]");
  if (recallButton) {
    state.quizAnswers[recallButton.dataset.recall] = "recalled";
    saveState(); renderAll();
    showToast("Good. Active recall makes knowledge last.");
  }

  const quizReset = event.target.closest("[data-quiz-reset]");
  if (quizReset) {
    delete state.quizAnswers[quizReset.dataset.quizReset];
    saveState(); renderAll();
  }

  const saveButton = event.target.closest("[data-save]");
  if (saveButton) {
    const id = saveButton.dataset.save;
    if (isSaved(id)) {
      state.saved = state.saved.filter(item => item !== id);
      showToast("Removed from saved");
    } else {
      trackEvent("card_save", { topic: findCard(id)?.topic });
      state.saved.unshift(id);
      showToast("Saved for later");
    }
    saveState(); renderAll();
  }

  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) { currentFilter = filterButton.dataset.filter; renderFilters(); renderLibrary(); }

  const miniCard = event.target.closest("[data-open-card]");
  if (miniCard) openCard(miniCard.dataset.openCard);
});

document.querySelector("#settings-button").addEventListener("click", () => {
  renderTopicOptions();
  document.querySelector("#topic-error").textContent = "";
  document.querySelector("#topic-dialog").showModal();
});

document.querySelector("#topic-form").addEventListener("submit", event => {
  event.preventDefault();
  const selected = [...new FormData(event.currentTarget).getAll("topic")];
  if (!selected.length) {
    document.querySelector("#topic-error").textContent = "Choose at least one topic.";
    return;
  }
  state.topics = selected;
  state.onboardingSeen = true;
  saveState();
  currentFilter = "all";
  document.querySelector("#topic-dialog").close();
  renderAll();
  ensureDailyCards();
  showToast("Your daily mix is ready");
});

document.querySelector("#discover-button").addEventListener("click", discoverFreshCard);

document.querySelector(".dialog-close").addEventListener("click", () => document.querySelector("#card-dialog").close());
document.querySelector("#card-dialog").addEventListener("click", event => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

renderAll();
ensureDailyCards();
const requestedCard = new URLSearchParams(location.search).get("card");
if (requestedCard && findCard(requestedCard)) openCard(requestedCard);
else if (!state.onboardingSeen) setTimeout(() => document.querySelector("#topic-dialog").showModal(), 350);
let renderedDay = dateKey();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && renderedDay !== dateKey()) { renderedDay = dateKey(); ensureDailyCards(); }
});
