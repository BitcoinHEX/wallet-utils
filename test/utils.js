const assert = require('assert');
const Utils = require('../utils');
const TestUtils = require('./testUtilities');

describe('Utils', () => {
  describe('buildAllTrueBitMask', () => {
    it('produces FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF for 128 bits', () => {
      assert.strict(Utils.buildAllTrueBitmask(128)
        .toString(16)
        .toUpperCase() === 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
    });

    it('produces FFFFFFFFFFFFFFFFFFFF for 80 bits', () => {
      const mask = Utils.buildAllTrueBitmask(80)
        .toString(16);
      assert.strict(mask
        .toUpperCase() === 'FFFFFFFFFFFFFFFFFFFF');
    });
  });

  describe('processDailyRangeData', () => {
    it('regenerates original values from packed values', () => {
      const data = TestUtils.buildRandomDailyData();
      const result = Utils.processDailyRangeData(data.map(x => x.combined));

      assert.strict(data.length === result.length);
      for (let i = 0; i < result.length; i += 1) {
        assert.strict(data[i].hearts.eq(result[i].dayPayoutTotal), `${data[i].hearts} not eq ${result[i].dayPayoutTotal}`);
        assert.strict(data[i].shares.eq(result[i].dayStakeSharesTotal), `${data[i].shares} not eq ${result[i].dayStakeSharesTotal}`);
      }
    });
  });

  // Need test for payout calculation functions
});
