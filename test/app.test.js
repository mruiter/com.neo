const test = require('node:test');
const assert = require('node:assert');
const appJson = require('../app.json');

test('uses Homey SDK v3', () => {
  assert.strictEqual(appJson.sdk, 3);
});
