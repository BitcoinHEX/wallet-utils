const BigInt = require('big-integer');

class Utils {
  static processDailyRangeData(data) {
    return data.map((sharesHearts) => {
      const asBig = BigInt(sharesHearts);
      return {
        dayStakeSharesTotal: asBig.shiftRight(128),
        dayPayoutTotal: asBig.and(BigInt('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16)),
      };
    });
  }
}

module.exports = Utils;
