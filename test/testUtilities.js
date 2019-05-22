const fs = require('fs');
const path = require('path');
const BigInt = require('big-integer');
const Contract = require('../contract');

function packSharesAndHearts(shares, hearts) {
  return shares.shiftLeft(128).or(hearts);
}


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

const buildRandomDailyData = () => {
  const size = Math.floor(Math.random() * 365);
  const data = [];
  for (let i = 0; i < size; i += 1) {
    const shares = BigInt.randBetween(10000000, 100000000);
    const hearts = BigInt.randBetween(1000000, 10000000);
    data.push({ shares, hearts, combined: packSharesAndHearts(shares, hearts) });
  }
  return data;
};


module.exports = {
  abi, newState, makeStake, buildRandomDailyData,
};
