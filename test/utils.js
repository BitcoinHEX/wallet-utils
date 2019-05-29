const assert = require('assert');
const fs = require('fs');
const path = require('path');
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

  describe('convertAbi', () => {
    it('has 52 keys without filters', () => {
      const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './HEX.abi.json'), 'utf8'));
      const converted = Utils.extractSimplifiedApi(abi);
      const numFunctions = Object.keys(converted.functions).reduce(sum => sum + 1, 0);
      const numEvents = Object.keys(converted.events).reduce(sum => sum + 1, 0);
      assert.strict(numFunctions === 36);
      assert.strict(numEvents === 16);
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
      const numFunctions = Object.keys(converted.functions).reduce(sum => sum + 1, 0);
      const numEvents = Object.keys(converted.events).reduce(sum => sum + 1, 0);
      assert.strict(numFunctions === 8);
      assert.strict(numEvents === 2);
    });
  });

  // Need test for payout calculation functions
});
