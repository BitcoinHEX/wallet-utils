const { bigNumberify } = require('ethers/utils');
const Utils = require('../utils');

const MIN_AUTO_STAKE_DAYS = 350;
const bigZero = bigNumberify(0);

function calcPayoutRewards(dailyPayoutData, stakeShares, beginDay, endDay) {
  let payout = bigZero;
  for (let day = beginDay; day < endDay; day += 1) {
    payout = payout.add(dailyPayoutData[day].dayPayoutTotal.mul(stakeShares)
      .div(dailyPayoutData[day].dayStakeSharesTotal));
  }
  return payout;
}

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
  const effectiveStakedDays = stakedDays + Utils.LATE_PENALTY_GRACE_DAYS;
  if (unpooledDays <= effectiveStakedDays) {
    return bigZero;
  }

  /* Calculate penalty as a percentage of stake return based on time */
  return rawStakeReturn.mul(unpooledDays - effectiveStakedDays).div(Utils.LATE_PENALTY_SCALE_DAYS);
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
  if (penaltyDays < Utils.EARLY_PENALTY_MIN_DAYS) {
    penaltyDays = Utils.EARLY_PENALTY_MIN_DAYS;
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

    const delta = calcPayoutRewards(dailyPayoutData, stakeShares, penaltyEndDay,
      servedEndDay);
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
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  static getStakes() {
    // read/return my stuff and push to store or... ?
  }

  static getDailyDataRange(offset, count) {
    try {
      return Utils.processDailyRangeData(this.dispatcher.callConstant('getDailyDataRange', [offset, count]));
    } catch (err) {
      console.error('EXCEPTION: getDailyDataRange', err);
    }
    return [];
  }

  startStake(newStakedHearts, newStakedDays) {
    return this.dispatcher.buildProxy('startStake', [newStakedHearts, newStakedDays]);
  }

  endStake(stakeIndex, stakeIdParam) {
    // bounds check on stake state
    return this.dispatcher.buildProxy('endStake', [stakeIndex, stakeIdParam]);
  }

  emergencyUnstake(stakeIndex, stakeIdParam) {
    // Just do it or error if mature?
    return this.dispatcher.buildProxy('endStake', [stakeIndex, stakeIdParam]);
  }

  static estimateReturn(stake, dailyPayoutData) {
    let servedDays = 0;
    const currentDay = Utils.getCurrentDay();
    const prevUnpooled = (stake.unpooledDay !== 0);
    let stakeReturn = bigZero;

    if (currentDay >= stake.pooledDay) {
      if (prevUnpooled) {
        /* Previously unpooled in goodAccounting(), so must have served full term */
        servedDays = stake.stakedDays;
      } else {
        servedDays = currentDay - stake.pooledDay;
        if (servedDays > stake.stakedDays) {
          servedDays = stake.stakedDays;
        } else if (stake.isAutoStake && servedDays < MIN_AUTO_STAKE_DAYS) {
          /* Deny early-unstake before an auto-stake minimum has been served */
          throw new Error('HEX: Auto-stake still locked');
        }
      }

      stakeReturn = calcStakeReturn(dailyPayoutData,
        stake, servedDays);
    } else {
      stakeReturn = stake.stakedHearts;
    }

    return stakeReturn;
  }
}

module.exports = Stake;
