const { AddressZero } = require('ethers/constants');
const { bigNumberify } = require('ethers/utils');
const Utils = require('../utils');

const CLAIM_REWARD_DAYS = 350;
const HEARTS_PER_SATOSHI = 1e4;
const MIN_AUTO_STAKE_DAYS = 350;


function adjustSillyWhale(rawSatoshis) {
  const asBig = bigNumberify(rawSatoshis);
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
  constructor(dispatcher, mockState) {
    this.dispatcher = dispatcher;
    this.mockState = mockState;
  }

  static getUnclaimed() {

  }

  static getSignMessage(ethAddress) {
    return `Claim_HEX_to_${ethAddress}`;
  }

  claim(utxo, statement, viaEthAddr, autoStakeDays, referrer) {
    const { rawPubKey, signature } = statement;
    return this.dispatcher.buildProxy('claimBtcAddress', [utxo.satoshis,
      utxo.proof,
      statement.claimToEthAddr,
      rawPubKey.subarray(0, 32),
      rawPubKey.subarray(32, 64),
      statement.addrType,
      signature.v,
      signature.r,
      signature.s,
      autoStakeDays || MIN_AUTO_STAKE_DAYS,
      referrer || AddressZero]);
  }

  estimateClaim(
    rawSatoshis,
    claimToAddr, // address, present only
    referrerAddr,
  ) {
    const day = (this.mockState && this.mockState.getCurrentDay()) || Utils.getCurrentDay();

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
