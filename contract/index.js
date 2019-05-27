const ethers = require('ethers');

class Contract {
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
    return ethers.utils.bigNumberify(Math.floor(
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

module.exports = Contract;
