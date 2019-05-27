const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Dispatch = require('../dispatch');
const Api = require('../api');

describe('api', () => {
  describe('convertAbi', () => {
    it('has 43 keys without filters', () => {
      const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './HEX.abi.json'), 'utf8'));
      const simpleApi = new Api(new Dispatch(abi, {}, () => ({}), '0x12345'), abi);
      const numFunctions = Object.keys(simpleApi.functions).reduce(sum => sum + 1, 0);
      const numEvents = Object.keys(simpleApi.events).reduce(sum => sum + 1, 0);
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

      const simpleApi = new Api(new Dispatch(abi, {}, () => ({}), '0x12345'), abi, evts, fns);
      const numFunctions = Object.keys(simpleApi.functions).reduce(sum => sum + 1, 0);
      const numEvents = Object.keys(simpleApi.events).reduce(sum => sum + 1, 0);
      assert.strict(numFunctions === 8);
      assert.strict(numEvents === 2);
    });
  });
});
