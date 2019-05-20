const ethers = require('ethers');
const tokenFunctions = require('../token');

const CLAIM_REWARD_DAYS = 350;
const HEARTS_PER_SATOSHI = 1e4;

function adjustSillyWhale(rawSatoshis) {
  if (rawSatoshis < 1000e8) {
    /* For < 1,000 BTC: no penalty */
    return rawSatoshis;
  }
  if (rawSatoshis >= 10000e8) {
    /* For >= 10,000 BTC: penalty is 75%, leaving 25% */
    return rawSatoshis / 4;
  }
  return rawSatoshis * (19000e8 - rawSatoshis) / 36000e8;
}

const claim = {

  getClaimStatement: ethAddress => `Claim_HEX_to_${ethAddress}`,
  claimBtcAddress: (
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
  ) => {
    const day = tokenFunctions.getCurrentDay();

    let adjSatoshis = adjustSillyWhale(rawSatoshis);
    const phaseDaysRemaining = CLAIM_REWARD_DAYS - day;
    const rewardDaysRemaining = phaseDaysRemaining < CLAIM_REWARD_DAYS
      ? phaseDaysRemaining + 1
      : CLAIM_REWARD_DAYS;

    // late claim
    adjSatoshis *= rewardDaysRemaining / CLAIM_REWARD_DAYS;

    let claimedHearts = adjSatoshis * HEARTS_PER_SATOSHI;

    // speed bonus
    claimedHearts += claimedHearts * phaseDaysRemaining / (CLAIM_REWARD_DAYS * 5);

    // referral
    if (referrerAddr) {
      // 10% for using referral link
      const referralBonus = claimedHearts / 10;
      claimedHearts += referralBonus;
      if (referrerAddr === claimToAddr) {
        // self refer gets the other 20%
        claimedHearts += referralBonus + referralBonus;
      }
    }
    return Promise.resolve(ethers.utils.bigNumberify(claimedHearts));
  },
};

module.exports = claim;
