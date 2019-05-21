const BigInt = require('big-integer');

class Utils {
  static processDailyRangeData(data) {
    return data.map((sharesHearts) => {
      const asBig = BigInt(sharesHearts);
      return {
        dayStakeSharesTotal: asBig.shiftRight(128),
        dayPayoutTotal: asBig.and(BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')),
      };
    });
  }
}

module.exports = Utils;
