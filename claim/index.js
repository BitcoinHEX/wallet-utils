const ethers = require('ethers');

const CLAIM_REWARD_DAYS = 350;
const HEARTS_PER_SATOSHI = 1e4;

function adjustSillyWhale(rawSatoshis) {
  const asBig = ethers.utils.bigNumberify(rawSatoshis);
  if (rawSatoshis < 1000e8) {
    /* For < 1,000 BTC: no penalty */
    return asBig;
  }
  if (rawSatoshis >= 10000e8) {
    /* For >= 10,000 BTC: penalty is 75%, leaving 25% */
    return asBig.div(4);
  }
  return asBig.mul((19000e8 - asBig)).div(36000e8);
}

class Claim {
  constructor(contractState) {
    this.contractState = contractState;
  }

  static getClaimStatement(ethAddress) {
    return `Claim_HEX_to_${ethAddress}`;
  }

  claimBtcAddress(
    rawSatoshis,
    proof, // UInt8Array not used
    claimToAddr, // address, present only
    pubKeyX, // UInt8Array not used
    pubKeyY, // UInt8Array not used
    addrType, // byte not used
    v, // byte not used
    r, // UInt8Array not used
    s, // UInt8Array not used
    autoStakeDays, // not used
    referrerAddr, // address, present only
  ) {
    const day = this.contractState.getCurrentDay();

    let adjSatoshis = adjustSillyWhale(rawSatoshis);
    const phaseDaysRemaining = CLAIM_REWARD_DAYS - day;
    const rewardDaysRemaining = phaseDaysRemaining < CLAIM_REWARD_DAYS
      ? phaseDaysRemaining + 1
      : CLAIM_REWARD_DAYS;

    // late claim
    adjSatoshis = adjSatoshis.mul(rewardDaysRemaining).div(CLAIM_REWARD_DAYS);

    let claimedHearts = adjSatoshis.mul(HEARTS_PER_SATOSHI);

    // speed bonus
    claimedHearts = claimedHearts.add(claimedHearts.mul(phaseDaysRemaining)
      .div(CLAIM_REWARD_DAYS * 5));

    // referral
    if (referrerAddr) {
      // 10% for using referral link
      const referralBonus = claimedHearts.div(10);
      claimedHearts = claimedHearts.add(referralBonus);
      if (referrerAddr === claimToAddr) {
        // self refer gets the other 20%
        claimedHearts = claimedHearts.add(referralBonus).add(referralBonus);
      }
    }
    return claimedHearts;
  }
}

module.exports = Claim;
