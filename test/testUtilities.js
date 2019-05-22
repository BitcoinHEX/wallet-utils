const fs = require('fs');
const path = require('path');
const Contract = require('../contract');

const abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './HEX.abi.json'), 'utf8'));

const newState = timeOverride => new Contract(timeOverride || Date.now());

const makeStake = (stakeId,
  stakedHearts,
  stakeShares,
  pooledDay, stakedDays,
  unpooledDay,
  isAutoStake) => ({
  stakeId,
  stakedHearts,
  stakeShares,
  pooledDay,
  stakedDays,
  unpooledDay,
  isAutoStake,
});



module.exports = { abi, newState, makeStake };
