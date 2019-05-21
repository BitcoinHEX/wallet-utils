const ethers = require('ethers');
const Token = require('../token');

const MIN_AUTO_STAKE_DAYS = 350;
const LATE_PENALTY_GRACE_DAYS = 14;
const LATE_PENALTY_SCALE_DAYS = 700;
const EARLY_PENALTY_MIN_DAYS = 90;

const bigZero = ethers.utils.bigNumberify(0);

function estimatePayoutRewardsDay(dailyData, stakeSharesParam, sampleDay) {
  // This is materially different from the contract function because
  // it calculates on "live" data and we want to act on stored state data

  return dailyData[sampleDay].dayPayoutTotal.mul(stakeSharesParam)
    .div(dailyData[sampleDay].dayStakeSharesTotal.add(stakeSharesParam));
}

function calcLatePenalty(
  stakedDays,
  unpooledDays,
  rawStakeReturn,
) {
  /* Allow grace time before penalties accrue */
  const effectiveStakedDays = stakedDays + LATE_PENALTY_GRACE_DAYS;
  if (unpooledDays <= effectiveStakedDays) {
    return bigZero;
  }

  /* Calculate penalty as a percentage of stake return based on time */
  return rawStakeReturn.mul(unpooledDays - effectiveStakedDays).div(LATE_PENALTY_SCALE_DAYS);
}

function calcPayoutRewards(dailyPayoutData, stakeShares, beginDay, endDay) {
  let payout = bigZero;
  for (let day = beginDay; day < endDay; day += 1) {
    payout = payout.add(dailyPayoutData[day].dayPayoutTotal.mul(stakeShares)
      .div(dailyPayoutData[day].dayStakeSharesTotal));
  }
  return payout;
}

function calcPayoutAndEarlyPenalty(
  dailyPayoutData,
  pooledDay,
  stakedDays,
  servedDays,
  stakeShares,
) {
  let payout = bigZero;
  let penalty = bigZero;

  const servedEndDay = pooledDay + servedDays;

  /* 50% of stakedDays (rounded up) with a minimum applied */
  let penaltyDays = stakedDays / 2 + (stakedDays % 2);
  if (penaltyDays < EARLY_PENALTY_MIN_DAYS) {
    penaltyDays = EARLY_PENALTY_MIN_DAYS;
  }

  if (servedDays === 0) {
    /* Fill penalty days with the estimated average payout */
    const expected = estimatePayoutRewardsDay(dailyPayoutData, stakeShares, pooledDay - 1);
    penalty = expected.mul(penaltyDays);
    return [payout, penalty]; // Actual payout was 0
  }

  if (penaltyDays < servedDays) {
    /*
            Simplified explanation of intervals where end-day is non-inclusive:

            penalty:    [pooledDay  ...  penaltyEndDay)
            delta:                      [penaltyEndDay  ...  servedEndDay)
            payout:     [pooledDay  .......................  servedEndDay)
        */
    const penaltyEndDay = pooledDay + penaltyDays;
    penalty = calcPayoutRewards(dailyPayoutData, stakeShares, pooledDay, penaltyEndDay);

    const delta = calcPayoutRewards(dailyPayoutData, stakeShares, penaltyEndDay, servedEndDay);
    payout = penalty.add(delta);
    return [payout, penalty];
  }

  /* penaltyDays >= servedDays  */
  payout = calcPayoutRewards(dailyPayoutData, stakeShares, pooledDay, servedEndDay);

  if (penaltyDays === servedDays) {
    penalty = payout;
  } else {
    /*
            (penaltyDays > servedDays) means not enough days served, so fill the
            penalty days with the average payout from only the days that were served.
        */
    penalty = payout.mul(penaltyDays).div(servedDays);
  }
  return [payout, penalty];
}

function calcStakeReturn(dailyData, st, servedDays) {
  let payout = bigZero;
  let penalty = bigZero;
  let stakeReturn = bigZero;
  let cappedPenalty = bigZero;

  if (servedDays < st.stakedDays) {
    [payout, penalty] = calcPayoutAndEarlyPenalty(
      dailyData,
      st.pooledDay,
      st.stakedDays,
      servedDays,
      st.stakeShares,
    );
    stakeReturn = st.stakedHearts.add(payout);
  } else {
    payout = calcPayoutRewards(st.stakeShares, st.pooledDay, st.pooledDay + servedDays);
    stakeReturn = st.stakedHearts.add(payout);

    penalty = calcLatePenalty(
      st.stakedDays,
      st.unpooledDay - st.pooledDay,
      stakeReturn,
    );
  }
  if (!bigZero.eq(penalty)) {
    if (penalty.gt(stakeReturn)) {
      /* Cannot have a negative stake return */
      // cappedPenalty = stakeReturn;
      stakeReturn = bigZero;
    } else {
      /* Remove penalty from the stake return */
      cappedPenalty = penalty;
      stakeReturn = stakeReturn.sub(cappedPenalty);
    }
  }
  return stakeReturn;
}

class Stake {
  constructor(contractStartTimeMillis) {
    this.token = new Token(contractStartTimeMillis);
    this.currentStakes = [];
    this.dailyPayoutData = [];
  }

  updateStakes(newStakeList) {
    this.currentStakes = newStakeList;
  }

  addStake(newStake) {
    this.currentStakes.push(newStake);
  }

  updateDailyPayoutData(newDailyPayoutData) {
    this.dailyPayoutData = newDailyPayoutData;
  }

  // startStake(newStakedHearts, newStakedDays){} - not useful to simulate?

  // goodAccounting(stakerAddr, stakeIndex, stakeIdParam){} - not useful to simulate?

  endStake(stakeIndex, stakeIdParam) {
    if (this.currentStakes.length === 0) {
      throw new Error('HEX: Empty stake list');
    }
    if (stakeIndex >= this.currentStakes.length) {
      throw new Error('HEX: stakeIndex invalid');
    }

    /* Get stake copy */
    const st = this.currentStakes[stakeIndex];
    if (stakeIdParam !== st.stakeId) {
      throw new Error('HEX: stakeIdParam not in stake');
    }

    let servedDays = 0;
    const currentDay = this.token.getCurrentDay();
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

      stakeReturn = calcStakeReturn(this.dailyPayoutData,
        st, servedDays);
    } else {
      stakeReturn = st.stakedHearts;
    }

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

    return stakeReturn;
  }

  // getStakeCount(ethAddr){} - not useful to simulate?
}

module.exports = Stake;
