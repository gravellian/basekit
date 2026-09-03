const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const scss = fs.readFileSync(path.join(root, 'scss/base/var/_wysiwyg.scss'), 'utf8');
const editor = fs.readFileSync(path.join(root, 'scss/editor-styles.scss'), 'utf8');
const fixture = fs.readFileSync(path.join(root, 'tests/fixtures/wysiwyg-contract.html'), 'utf8');

const vocabulary = [
  'font-body', 'font-heading', 'font-heading-narrow',
  'copy-smallest', 'copy-small', 'copy-normal', 'copy-large', 'copy-largest',
  'text-primary', 'text-accent', 'text-secondary', 'text-neutral', 'text-light',
  'underline-accent', 'surface-light', 'surface-primary', 'surface-accent',
];

test('the semantic WYSIWYG vocabulary has shared styling', () => {
  const css = require('sass').compileString("@use 'base' as *; .body-style { @include bodyStyle; }", {
    loadPaths: [path.join(root, 'scss')], logger: require('sass').Logger.silent,
  }).css;
  for (const className of vocabulary) assert.match(css, new RegExp(`\\.${className}\\b`));
});

test('paragraph and inline sizes share the body baseline without nested em scaling', () => {
  const sass = require('sass');
  const postcss = require('postcss');
  const css = sass.compileString("@use 'base' as *; .body-style { @include bodyStyle; } .ck-content { @include bodyStyle; }", {
    loadPaths: [path.join(root, 'scss')], logger: sass.Logger.silent,
  }).css;
  const tree = postcss.parse(css);
  for (const role of ['smallest', 'small', 'normal', 'large', 'largest']) {
    const sizes = [];
    for (const rootSelector of ['.body-style', '.ck-content']) {
      for (const tag of ['p', 'span']) {
        tree.walkRules(rule => {
          if (rule.selector.split(',').map(s => s.trim()).includes(`${rootSelector} ${tag}.copy-${role}`)) {
            rule.walkDecls('font-size', decl => sizes.push(decl.value));
          }
        });
      }
    }
    assert.equal(sizes.length, 4);
    assert.equal(new Set(sizes).size, 1);
    assert.match(sizes[0], /--font-size-body/);
    assert.doesNotMatch(sizes[0], /[\d.]em\b/);
  }
});

test('the representative fixture uses only approved semantic classes', () => {
  const classes = [...fixture.matchAll(/class="([^"]+)"/g)]
    .flatMap((match) => match[1].split(/\s+/))
    .filter((className) => className !== 'body-style');
  assert.deepEqual([...new Set(classes.filter((name) => !vocabulary.includes(name)))], []);
});

test('the editor canvas uses the shared readable-width contract', () => {
  assert.match(editor, /--wysiwyg-content-width, 60rem/);
  assert.match(editor, /--wysiwyg-gutter/);
});

test('subtheme editor media gutters survive the figure reset', () => {
  const sass = require('sass');
  const postcss = require('postcss');
  const css = sass.compileString(`@use 'base' as *;
    .ck.ck-editor__editable_inline.ck-content { @include bodyStyle; }
  `, { loadPaths: [path.join(root, 'scss')], logger: sass.Logger.silent }).css;
  const tree = postcss.parse(css);
  for (const [side, property] of [['right', 'margin-left'], ['left', 'margin-right']]) {
    const selector = `.ck.ck-editor__editable_inline.ck-content figure.drupal-media-style-align-${side}`;
    let gutter;
    tree.walkRules(selector, rule => {
      rule.walkDecls(property, decl => {
        if (rule.parent.type === 'atrule' && rule.parent.params.includes('768px')) gutter = decl.value;
      });
    });
    assert.equal(gutter, '2em');
  }
});
