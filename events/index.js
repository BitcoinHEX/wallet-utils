const { AddressZero } = require('ethers/constants');

function getOptionalAddr(addr, defaultAddr = null) {
  if (addr && addr !== AddressZero) {
    return addr;
  }
  return defaultAddr;
}

// function addTxEvtId(e) {
//   e.txId = e.blockNumber * 1e6 + e.transactionIndex * 10;
//   e.evtId = e.txId + e.logIndex;
// }

class Events {
  static commonFields(e, tx, addr) {
    const a = e.args;

    const user = a.stakerAddr || a.claimToAddr || a.memberAddr;
    const referrer = getOptionalAddr(a.referrerAddr);
    const sender = getOptionalAddr(a.senderAddr, addr);

    const isReferral = referrer && referrer !== addr;
    const isAssist = sender === addr && sender !== user;

    const evt = {
      evtId: e.evtId,
      txId: e.txId,
      timestamp: tx.timestamp,
    };

    return {
      evt, user, referrer, sender, isReferral, isAssist,
    };
  }

  static convertClaimReferral(e, tx, addr) {
    const { isReferral } = this.commonFields(e, tx, addr);
    return {
      evtId: e.evtId,
      txId: e.txId,
      time: tx.timestamp.toUTCString(),
      method: 'Claim',
      hex: isReferral ? e.args.claimedHearts / 5e8 : e.args.claimedHearts / 3.125e8,
    };
  }

  static convertTransformReferral(e, tx, addr) {
    const { isReferral } = this.commonFields(e, tx, addr);
    return {
      evtId: e.evtId,
      txid: e.txId,
      time: tx.timestamp.toUTCString(),
      method: 'Transform',
      hex: isReferral ? e.args.xfAmount / 5e8 : e.args.xfAmount / 3.125e8,
    };
  }
}

module.exports = Events;
