const assert = require('assert');
const Utils = require('../utils');
const TestUtils = require('./testUtilities');

describe('Utils', () => {
  describe('processDailyRangeData', () => {
    it('works', () => {
      const data = TestUtils.buildRandomDailyData();
      const result = Utils.processDailyRangeData(data.map(x => x.combined));

      assert.strict(data.length === result.length);
      for (let i = 0; i < result.length; i += 1) {
        assert.strict(data[i].hearts.eq(result[i].dayPayoutTotal), `${data[i].hearts} not eq ${result[i].dayPayoutTotal}`);
        assert.strict(data[i].shares.eq(result[i].dayStakeSharesTotal), `${data[i].shares} not eq ${result[i].dayStakeSharesTotal}`);
      }
    });
  });
});
