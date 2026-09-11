// Run with: node check.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), `Missing anchor ${id}`);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.match(html, /<main id="main">\s*<section id="concepts"/, 'Start with the four concepts');
assert(!/class="(?:roadmap|number|learning-goals)"/.test(html), 'No numbered learning path');
assert(!/astra|codex|chatgpt/i.test(html), 'Keep the guide focused on concepts');
for (const concept of ['agent', 'skill', 'connector', 'subagent']) {
  assert(ids.includes(`concept-${concept}`), `Missing concept ${concept}`);
}

assert.deepEqual([...html.matchAll(/<section id="([^"]+)"/g)].map(match => match[1]), ['concepts', 'travel']);
assert(!/<script\b|class="copy"/.test(html), 'Native controls need no script');
for (const [, id] of html.matchAll(/aria-controls="([^"]+)"/g)) assert(ids.includes(id), `Missing controlled panel ${id}`);
assert.match(html, /conversation and prices below are made up/);
assert.match(html, /flight search, reservations, and payments are simulated/);
assert.match(html, /https:\/\/soar\.flights\/mcp/);
console.log('PASS: page anchors, four concepts, travel example, and native controls.');

// WCAG normal-text contrast, including the muted text and selected controls.
function luminance(hex) {
  const rgb = hex.match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
for (const [foreground, background] of [['252a26','faf9f5'], ['62685f','faf9f5'], ['62685f','edf0e8'], ['254f40','edf0e8'], ['ffffff','254f40']]) {
  const values = [luminance(foreground), luminance(background)].sort((a,b) => b-a);
  assert((values[0] + .05) / (values[1] + .05) >= 4.5, 'Text contrast must reach 4.5:1');
}
