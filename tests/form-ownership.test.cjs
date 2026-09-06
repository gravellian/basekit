const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('Gin and Drupal core retain ownership of administrative form markup', () => {
  for (const directory of ['form', 'content-edit']) {
    const files = fs.readdirSync(path.join(root, 'templates', directory));
    assert.deepEqual(files, [], `${directory} must not contain copied core templates`);
  }
});

test('BaseKit exposes a low-specificity public form contract', () => {
  const source = fs.readFileSync(path.join(root, 'scss', '_forms.scss'), 'utf8');
  assert.match(source, /--basekit-form-control-background/);
  assert.match(source, /:where\(/);
  assert.match(source, /\.user-login-form/);
  assert.doesNotMatch(source, /\.gin-|\.admin-/);
});
