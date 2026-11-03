// Website content integrity audit. Run: node scripts/audit-content.cjs
// This checks structural completeness, not factual accuracy or editorial translation quality.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({});
for (const file of ["content.js", "content-el.js", "content-ru.js", "content-ro.js", "extra-content.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}
const snapshot = vm.runInContext(
  "({ topics: TOPICS, cards: CARDS, quizzes: QUIZZES, translations: { el: CONTENT_EL, ru: CONTENT_RU, ro: CONTENT_RO } })",
  context
);
const { topics, cards, quizzes, translations } = snapshot;
const locales = ["en", "el", "ru", "ro"];
const errors = [];
const fail = (id, message) => errors.push(`${id}: ${message}`);
const seen = new Set();
const perTopic = Object.fromEntries(Object.keys(topics).map((id) => [id, 0]));
const normalized = (s) => String(s).normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g, " ");
const questionKeys = Object.fromEntries(locales.map((lang) => [lang, new Map()]));

for (const card of cards) {
  const id = card.id;
  if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(id)) fail(String(id), "invalid card ID");
  if (seen.has(id)) fail(id, "duplicate card ID");
  seen.add(id);
  if (!Object.hasOwn(topics, card.topic)) fail(id, "unknown topic");
  else perTopic[card.topic]++;
  for (const field of ["title", "hook", "concept", "example", "takeaway", "sourceName"]) {
    if (typeof card[field] !== "string" || !card[field].trim()) fail(id, `missing ${field}`);
  }
  if (typeof card.sourceUrl !== "string" || !/^https:\/\/[^/\s]+/.test(card.sourceUrl)) fail(id, "invalid HTTPS source URL");
  const quiz = quizzes[id];
  if (!quiz) { fail(id, "missing quiz"); continue; }
  if (!Number.isInteger(quiz.answer) || quiz.answer < 0 || quiz.answer > 2) fail(id, "invalid correct-answer index");
  for (const lang of locales) {
    const row = lang === "en"
      ? [card.title, card.hook, card.concept, card.example, card.takeaway, quiz.question, quiz.options, quiz.feedback]
      : translations[lang][id];
    if (!Array.isArray(row) || row.length !== 8) { fail(id, `${lang}: missing or malformed translation`); continue; }
    if (!Array.isArray(row[6]) || row[6].length !== 3) { fail(id, `${lang}: expected exactly three answer choices`); continue; }
    const texts = [...row.slice(0, 6), ...row[6], row[7]];
    if (texts.some((s) => typeof s !== "string" || !s.trim())) fail(id, `${lang}: blank or invalid text`);
    if (new Set(row[6].map(normalized)).size !== 3) fail(id, `${lang}: repeated answer choices`);
    const key = normalized(row[5]);
    const existing = questionKeys[lang].get(key);
    if (existing) fail(id, `${lang}: duplicate quiz question (also ${existing})`);
    else questionKeys[lang].set(key, id);
  }
}
for (const id of Object.keys(quizzes)) if (!seen.has(id)) fail(id, "orphan quiz");
for (const lang of locales.filter((lang) => lang !== "en")) {
  for (const id of Object.keys(translations[lang])) if (!seen.has(id)) fail(id, `${lang}: orphan translation`);
}
assert.ok(cards.length >= 96, "Expected at least the existing 96 curated cards");
assert.equal(Object.keys(topics).length, 12, "Expected twelve established topics");
for (const [id, count] of Object.entries(perTopic)) if (count < 8) fail(id, `only ${count} cards; expected at least eight`);

if (errors.length) {
  console.error("Website content audit failed:\n" + errors.map((e) => "- " + e).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${cards.length} distinct cards, ${Object.keys(topics).length} topics, ${locales.length} full locale rows, quizzes, sources and structural duplicate checks.`);
  console.log("Topic counts: " + Object.entries(perTopic).map(([topic, count]) => `${topic}=${count}`).join(", "));
  console.log("Editorial/factual accuracy, external source availability and native-speaker quality still need separate review.");
}
