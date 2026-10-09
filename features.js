/* Small enhancements; the learning app continues to work without these services. */
let installPrompt = null;
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  document.querySelector("#install-help").textContent = "Installed. Find One Card Wiser on your home screen.";
  document.querySelector("#install-help").hidden = false;
});
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#install-button").addEventListener("click", async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
    } else {
      const help = document.querySelector("#install-help");
      help.hidden = !help.hidden;
      help.textContent = /iPhone|iPad|iPod/.test(navigator.userAgent)
        ? "In Safari, open Share → Add to Home Screen. Your progress stays with this device; check your saved cards after installation."
        : "Open your browser menu and look for Install app or Add to Home Screen. If it is already installed, open it from your home screen.";
    }
  });
  document.querySelector("#analytics-settings").addEventListener("click", analyticsChoices);
  if (analyticsConfigured()) {
    let consent;
    try { consent = localStorage.getItem("ocw-analytics-consent"); } catch { /* Storage may be unavailable. */ }
    if (consent === "yes") startAnalytics();
    else if (consent !== "no") analyticsChoices();
  }
  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register("./sw.js").catch(() => { /* Online app remains available. */ });
  }
});

function renderWeeklyProgress() {
  let count = 0, days = 0;
  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(); date.setDate(date.getDate() - offset);
    const ids = state.completionLog[dateKey(date)] || [];
    count += ids.length;
    if (ids.length) days++;
  }
  document.querySelector("#weekly-progress").textContent = `Last 7 days: ${count} ${count === 1 ? "card" : "cards"} completed · ${days} ${days === 1 ? "day" : "days"} of learning`;
}

function publicCardUrl(card) {
  return card.discovered ? "https://onecardwiser.com/" : `https://onecardwiser.com/cards/${encodeURIComponent(card.id)}/`;
}

async function shareCard(id) {
  const card = findCard(id);
  if (!card) return;
  const url = publicCardUrl(card);
  const text = `${card.title}\n${card.hook}${card.discovered ? `\nSource: ${safeUrl(card.sourceUrl)}` : ""}`;
  try {
    if (navigator.share) await navigator.share({ title: "One Card Wiser", text, url });
    else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(`${text}\n${url}`); showToast("Idea and link copied."); }
    else {
      const box = document.createElement("dialog");
      const p = document.createElement("p"); p.textContent = "Copy this idea and link:";
      const input = document.createElement("textarea"); input.value = `${text}\n${url}`; input.rows = 8;
      const close = document.createElement("button"); close.textContent = "Close"; close.className = "secondary-button";
      close.onclick = () => box.close(); box.append(p, input, close); document.body.append(box);
      box.addEventListener("close", () => box.remove(), { once: true }); box.showModal(); input.select();
    }
    trackEvent("card_share", { topic: card.topic });
  } catch (error) { if (error.name !== "AbortError") showToast("Sharing was unavailable. Try Download story instead."); }
}

function wrapLines(ctx, text, width) {
  const lines = []; let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > width && line) { lines.push(line); line = word; }
    else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

async function downloadStory(id) {
  const card = findCard(id); if (!card) return;
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f3efe7"; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = TOPICS[card.topic].accent; ctx.fillRect(80, 140, 920, 10);
  ctx.font = "bold 44px sans-serif"; ctx.fillText("1W  /  ONE CARD WISER", 80, 250);
  ctx.font = "28px sans-serif"; ctx.fillStyle = "#67635c";
  ctx.fillText(TOPICS[card.topic].label.toUpperCase(), 80, 335);
  let size = 82, titleLines;
  do { ctx.font = `bold ${size}px Georgia, serif`; titleLines = wrapLines(ctx, card.title, 900); if (titleLines.length <= 5) break; size -= 2; } while (size > 42);
  ctx.fillStyle = "#292823";
  titleLines.forEach((line, i) => ctx.fillText(line, 80, 480 + i * (size + 12)));
  let y = 480 + titleLines.length * (size + 12) + 70;
  let bodySize = 42, bodyLines;
  do { ctx.font = `${bodySize}px sans-serif`; bodyLines = wrapLines(ctx, card.hook, 900); if (y + bodyLines.length * (bodySize + 16) <= 1450) break; bodySize -= 2; } while (bodySize > 22);
  bodyLines.forEach((line, i) => ctx.fillText(line, 80, y + i * (bodySize + 16)));
  ctx.fillStyle = "#67635c"; ctx.font = "24px sans-serif";
  ctx.fillText(`Source: ${card.sourceName || "Wikipedia"}`, 80, 1560);
  if (card.discovered) {
    ctx.fillText("Wikipedia source preview · adapted · CC BY-SA 4.0", 80, 1610);
    ctx.font = "18px sans-serif";
    const source = safeUrl(card.sourceUrl);
    wrapLines(ctx, source, 900).slice(0, 3).forEach((line, i) => ctx.fillText(line, 80, 1645 + i * 24));
  }
  ctx.fillStyle = "#292823"; ctx.font = "bold 40px sans-serif"; ctx.fillText("Build a mind you’re proud of.", 80, 1770);
  ctx.font = "32px sans-serif"; ctx.fillText("onecardwiser.com", 80, 1840);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) { showToast("Image export failed. Try Share idea."); return; }
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = `one-card-wiser-${card.id}.png`; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  trackEvent("story_download", { topic: card.topic });
  showToast("Story image downloaded. Find it in your downloads.");
}

function analyticsConfigured() { return /^G-[A-Z0-9]+$/.test(window.OCW_ANALYTICS_ID || ""); }
let analyticsStarted = false;
function startAnalytics() {
  window[`ga-disable-${window.OCW_ANALYTICS_ID}`] = false;
  if (analyticsStarted || !analyticsConfigured()) return;
  analyticsStarted = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", window.OCW_ANALYTICS_ID, { allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location.origin + location.pathname });
  const script = document.createElement("script"); script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(window.OCW_ANALYTICS_ID)}`;
  document.head.append(script);
}
function trackEvent(name, parameters = {}) {
  let allowed = false; try { allowed = localStorage.getItem("ocw-analytics-consent") === "yes"; } catch { /* No consent stored. */ }
  if (allowed && analyticsStarted && window.gtag) window.gtag("event", name, parameters);
}
function analyticsChoices() {
  if (!analyticsConfigured()) { showToast("Analytics is not enabled. Learning progress is stored on this device."); return; }
  if (document.querySelector("#analytics-dialog")) return;
  const dialog = document.createElement("dialog"); dialog.id = "analytics-dialog";
  dialog.innerHTML = '<h2>Help improve One Card Wiser?</h2><p>Optional Google Analytics measures visits and actions such as completing or sharing a card. Google may receive device and usage information. You can decline and keep learning.</p><p><a href="./privacy/">Read the privacy details</a></p><div class="card-actions"><button class="secondary-button" data-consent="no">Decline analytics</button><button class="secondary-button" data-consent="yes">Allow analytics</button></div>';
  dialog.addEventListener("click", event => {
    const choice = event.target.closest("[data-consent]")?.dataset.consent;
    if (!choice) return;
    try { localStorage.setItem("ocw-analytics-consent", choice); } catch { dialog.close(); return; }
    if (choice === "yes") startAnalytics();
    else {
      window[`ga-disable-${window.OCW_ANALYTICS_ID}`] = true;
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.trim().split("=")[0];
        if (/^_ga(?:_|$)/.test(name)) for (const domain of ["", `;domain=${location.hostname}`, ";domain=.onecardwiser.com"]) document.cookie = `${name}=;max-age=0;path=/${domain}`;
      }
    }
    dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true }); document.body.append(dialog); dialog.showModal();
}
