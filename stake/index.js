const ethers = require('ethers');
const Utils = require('../utils');

const MIN_AUTO_STAKE_DAYS = 350;

const bigZero = ethers.utils.bigNumberify(0);

class Stake {
  constructor(contractState) {
    this.contractState = contractState;
  }

  // startStake(newStakedHearts, newStakedDays){} - not useful to simulate?

  // goodAccounting(stakerAddr, stakeIndex, stakeIdParam){} - not useful to simulate?

  endStake(stakeIndex, stakeIdParam) {
    if (this.contractState.getCurrentStakes().length === 0) {
      throw new Error('HEX: Empty stake list');
    }
    if (stakeIndex >= this.contractState.getCurrentStakes().length) {
      throw new Error('HEX: stakeIndex invalid');
    }

    /* Get stake copy */
    const st = this.contractState.getCurrentStakes()[stakeIndex];
    if (stakeIdParam !== st.stakeId) {
      throw new Error('HEX: stakeIdParam not in stake');
    }

    let servedDays = 0;
    const currentDay = this.contractState.getCurrentDay();
    const prevUnpooled = (st.unpooledDay !== 0);
    let stakeReturn = bigZero;

    if (currentDay >= st.pooledDay) {
      if (prevUnpooled) {
        /* Previously unpooled in goodAccounting(), so must have served full term */
        servedDays = st.stakedDays;
      } else {
        st.unpooledDay = currentDay;

        servedDays = currentDay - st.pooledDay;
        if (servedDays > st.stakedDays) {
          servedDays = st.stakedDays;
        } else if (st.isAutoStake && servedDays < MIN_AUTO_STAKE_DAYS) {
          /* Deny early-unstake before an auto-stake minimum has been served */
          throw new Error('HEX: Auto-stake still locked');
        }
      }

      stakeReturn = Utils.calcStakeReturn(this.contractState.getDailyPayoutData(),
        st, servedDays);
    } else {
      stakeReturn = st.stakedHearts;
    }

    this.contractState.removeStake(stakeIndex);

    return stakeReturn;
  }

  // getStakeCount(ethAddr){} - not useful to simulate?
}

module.exports = Stake;
