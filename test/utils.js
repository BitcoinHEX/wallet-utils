const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Utils = require('../utils');
const TestUtils = require('./testUtilities');

describe('Utils', () => {
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

  describe('convertAbi', () => {
    it('has 43 keys without filters', () => {
      const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './HEX.abi.json'), 'utf8'));
      const converted = Utils.extractSimplifiedApi(abi);
      console.log(converted);
      const numFunctions = Object.keys(converted.functions).reduce(sum => sum + 1, 0);
      const numEvents = Object.keys(converted.events).reduce(sum => sum + 1, 0);
      assert.strict(numFunctions === 33);
      assert.strict(numEvents === 10);
    });

    it('has 10 keys with filters', () => {
      const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './HEX.abi.json'), 'utf8'));
      const evts = ['EndStake', 'StartStake'];

      const fns = ['startStake',
        'getCurrentDay',
        'balanceOf',
        'endStake',
        'staked',
        'claimBtcAddress',
        'getDailyDataRange',
        'getGlobalInfo',
      ];

      const converted = Utils.extractSimplifiedApi(abi, evts, fns);
      console.log(converted);
      const numFunctions = Object.keys(converted.functions).reduce(sum => sum + 1, 0);
      const numEvents = Object.keys(converted.events).reduce(sum => sum + 1, 0);
      assert.strict(numFunctions === 8);
      assert.strict(numEvents === 2);
    });
  });

  // Need test for payout calculation functions
});
