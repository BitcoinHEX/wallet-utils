const assert = require('assert');
const hexUtils = require('../index');

describe('hexUtils', () => {
  describe('add()', () => {
    it('should add the numbers together', () => {
      assert.equal(hexUtils.add(1, 2), 3);
    });
  });
});
