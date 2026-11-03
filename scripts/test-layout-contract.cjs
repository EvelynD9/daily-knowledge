// Lightweight source-level guards; real visual verification still requires browsers.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
assert.match(html, /id="settings-button"[^>]*data-i18n="Choose topics"[^>]*>Choose topics<\/button>/);
assert.match(html, /<meta name="viewport" content="width=device-width/);
assert.match(css, /\.topbar #settings-button\s*\{[^}]*width:auto;[^}]*min-width:108px;[^}]*white-space:normal;/);
assert.doesNotMatch(css, /\.topbar #settings-button\s*\{[^}]*width:44px;/);
for (const selector of [".card-title", ".quiz-question", ".mini-card h3"]) {
  assert.ok(css.includes(selector), `Missing reader selector ${selector}`);
}
assert.match(css, /overflow-wrap:\s*anywhere;/);
assert.match(css, /\.why-row\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);/);
console.log("PASS mobile topic-label and long-text layout source guards (not screenshots).");
