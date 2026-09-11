// Run with: node check.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const script = fs.readFileSync(`${__dirname}/script.js`, 'utf8');
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

(async () => {
  for (const blocked of [false, true]) {
    let handler, copied, selected;
    const prompt = { textContent: '  Teach me one idea at a time.  ' };
    const status = {};
    const button = { hidden: true, addEventListener: (_, fn) => handler = fn,
      closest: () => ({ querySelector: () => prompt }) };
    vm.runInNewContext(script, {
      document: { querySelectorAll: () => [button], getElementById: () => status,
        createRange: () => ({ selectNodeContents: value => selected = value }) },
      navigator: { clipboard: { writeText: async text => { if (blocked) throw Error('Denied'); copied = text; } } },
      window: { getSelection: () => ({ removeAllRanges() {}, addRange() {} }) },
    });
    assert.equal(button.hidden, false);
    await handler();
    if (blocked) {
      assert.equal(selected, prompt);
      assert.equal(button.textContent, 'Text selected');
      assert.match(status.textContent, /selected/);
    } else {
      assert.equal(copied, prompt.textContent.trim());
      assert.equal(button.textContent, 'Copied ✓');
      assert.match(status.textContent, /^Copied!/);
    }
  }
  console.log('PASS: page anchors, concept scope, and clipboard success/fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });

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
