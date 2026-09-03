const assert = require('node:assert/strict');
const path = require('node:path');
const sass = require('sass');
const root = path.resolve(__dirname, '..');
const loadPaths = [path.join(root, 'scss')];
const compile = (source) => sass.compileString(source, { loadPaths }).css;

assert.equal(compile("@use 'copy-scale';"), '', 'API must remain opt-in');
const css = compile("@use 'copy-scale'; @include copy-scale.install($body-size: max(18px, 1.85rem));");
for (const token of ['body', 'body-smallest', 'body-small', 'body-large', 'body-largest', 'body-ui']) {
  assert.ok(css.includes(`--font-size-${token}:`), token);
}
for (const role of ['copy-smallest', 'copy-small', 'copy-normal', 'copy-large', 'copy-largest', 'copy-ui', '.topic-text', '.text', '.block-system-breadcrumb-block']) {
  assert.ok(css.includes(role), role);
}
assert.ok(css.includes('max(18px, 1.85rem)'));
assert.ok(!css.includes('max-inline-size'));
assert.ok(!css.includes('h2'));
const custom = compile("@use 'copy-scale'; @include copy-scale.install($small: .8, $large: 1.2, $ui: .7);");
for (const ratio of ['0.8', '1.2', '0.7']) assert.ok(custom.includes(`* ${ratio})`));
const starter = sass.compile(path.join(root, 'web/themes/custom/basekit/subtheme-starter/scss/styles.scss'), { loadPaths }).css;
assert.ok(starter.includes('--font-size-body: max(18px, 1.7rem)'));
console.log('Copy-scale contract and starter compilation passed.');
