const { AddressZero } = require('ethers/constants');
const { bigNumberify, hexZeroPad } = require('ethers/utils');
const BN = require('bn.js');

const LATE_PENALTY_GRACE_DAYS = 14;
const LATE_PENALTY_SCALE_DAYS = 700;
const EARLY_PENALTY_MIN_DAYS = 90;
const bigZero = new BN(0);
const CONTRACT_LAUNCH_TIME = Date.now(); // to be filled with real?

class Utils {
  static get LATE_PENALTY_GRACE_DAYS() {
    return LATE_PENALTY_GRACE_DAYS;
  }

  static get LATE_PENALTY_SCALE_DAYS() {
    return LATE_PENALTY_SCALE_DAYS;
  }

  static get EARLY_PENALTY_MIN_DAYS() {
    return EARLY_PENALTY_MIN_DAYS;
  }

  static get bigZero() {
    return bigZero;
  }

  static bigNumberify(n) {
    return bigNumberify(n);
  }

  static hexZeroPad(str, n) {
    return hexZeroPad(str, n);
  }

  static getOptionalAddr(addr, defaultAddr = null) {
    if (addr && addr !== AddressZero) {
      return addr;
    }
    return defaultAddr;
  }

  static getDailyPayoutData() {
    return this.dailyPayoutData;
  }

  static getNowTimestamp() {
    return Math.trunc(Date.now() / 1000);
  }

  static getDayFromTimestamp(timestamp) {
    return Math.trunc((timestamp - CONTRACT_LAUNCH_TIME) / 86400);
  }

  static getTimeOfDayFromTimestamp(timestamp) {
    return (timestamp - CONTRACT_LAUNCH_TIME) % 86400;
  }

  static setDailyPayoutData(newDailyPayoutData) {
    this.dailyPayoutData = newDailyPayoutData;
  }

  static getCurrentDay() {
    return this.getDayFromTimestamp(this.getNowTimestamp());
  }

  static processDailyRangeData(data) {
    return data.map((satoshisSharesHearts) => {
      let b = new BN(satoshisSharesHearts.toString());
      const dayPayoutTotal = bigNumberify(b.maskn(80).toString());
      b = b.shrn(80);
      const dayStakeSharesTotal = bigNumberify(b.maskn(80).toString());
      b = b.shrn(80);
      const dayUnclaimedSatoshisTotal = bigNumberify(b.toString());
      return {
        dayStakeSharesTotal,
        dayPayoutTotal,
        dayUnclaimedSatoshisTotal,
      };
    });
  }
}

module.exports = Utils;
