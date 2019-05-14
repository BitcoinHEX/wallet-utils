const assert = require('assert');
const hexUtils = require('../index');

describe('transform', () => {
  describe('dayProxy()', () => {
    it('Should remap day -1 to 352', () => {
      assert.equal(hexUtils.transform.dayProxy(-1), 352);
    });
    it('Should remap day -2 to 351', () => {
      assert.equal(hexUtils.transform.dayProxy(-2), 351);
    });
    it('Should return expected day for all other days', () => {
      assert.equal(hexUtils.transform.dayProxy(1), 1);
      assert.equal(hexUtils.transform.dayProxy(15), 15);
      assert.equal(hexUtils.transform.dayProxy(68), 68);
    });
  });
});
