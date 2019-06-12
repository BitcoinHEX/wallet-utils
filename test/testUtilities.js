const { bigNumberify } = require('ethers/utils');
const BN = require('bn.js');

class MockContract {
  constructor(contractStartDateMillis) {
    this.startTimeMillis = contractStartDateMillis;
    this.currentStakes = [];
    this.dailyPayoutData = [];
  }

  getCurrentDay() {
    const now = Date.now();
    if (now < this.startTimeMillis) {
      throw new Error('Current day earlier than contract launch');
    }
    return bigNumberify(Math.floor(
      Math.abs(now - this.startTimeMillis) / (1000 * 86400),
    ));
  }

  getCurrentStakes() {
    return this.currentStakes;
  }

  updateStakes(newStakeList) {
    this.currentStakes = newStakeList;
  }

  addStake(newStake) {
    this.currentStakes.push(newStake);
  }

  removeStake(stakeIndex) {
    // remove stake from the list in the same way the contract does
    const lastIndex = this.currentStakes.length - 1;

    /* Skip the copy if element to be removed is already the last element */
    if (stakeIndex !== lastIndex) {
      /* Copy last element to the requested element's "hole" */
      this.currentStakes[stakeIndex] = this.currentStakes[lastIndex];
    }

    /*
            Reduce the array length now that the array is contiguous.
        */
    this.currentStakes.pop();
  }

  getDailyPayoutData() {
    return this.dailyPayoutData;
  }

  updateDailyPayoutData(newDailyPayoutData) {
    this.dailyPayoutData = newDailyPayoutData;
  }
}


function packSharesAndHearts(satoshis, shares, hearts) {
  return new BN(satoshis.toString()).iushln(80).iuor(new BN(shares.toString())).iushln(80)
    .iuor(new BN(hearts.toString()));
}

const { abi } = require('../abi');

const newState = timeOverride => new MockContract(timeOverride || Date.now());

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

function randBetween(l, h) {
  return bigNumberify(Math.floor(Math.random() * (h - 1) + l).toString());
}

const buildRandomDailyData = () => {
  const size = Math.floor(Math.random() * 365);
  const data = [];
  for (let i = 0; i < size; i += 1) {
    const satoshis = randBetween(100000, 1000000);
    const shares = randBetween(10000000, 100000000);
    const hearts = randBetween(1000000, 10000000);
    data.push({
      satoshis, shares, hearts, combined: packSharesAndHearts(satoshis, shares, hearts),
    });
  }
  return data;
};

module.exports = {
  abi, newState, makeStake, buildRandomDailyData, MockContract,
};
