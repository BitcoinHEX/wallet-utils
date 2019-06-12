const { AddressZero } = require('ethers/constants');

function getOptionalAddr(addr, defaultAddr = null) {
  if (addr && addr !== AddressZero) {
    return addr;
  }
  return defaultAddr;
}

class Events {
  constructor(contractAddress, iface, dispatch) {
    this.contractAddress = contractAddress;
    this.interface = iface;
    this.dispatch = dispatch;
  }

  parseLogForValues(e) {
    return this.interface.parseLog(e).values;
  }

  addContractEventListeners(eventCallback, errorCallback) {
    this.dispatch.subscribe('*', eventCallback);
    this.dispatch.subscribeOnError(errorCallback);
  }

  removeContractEventListeners() {
    this.dispatch.removeAllListeners('*');
    this.dispatch.removeAllErrorListeners();
  }

  async getAllLogs(topic, startBlock) {
    const filter = {
      fromBlock: startBlock,
      toBlock: 'latest',
      address: this.contractAddress,
    };

    let logs1 = this.dispatch.getLogs({ ...filter, topics: [null, topic] });
    let logs2 = this.dispatch.getLogs({ ...filter, topics: [null, null, topic] });
    let logs3 = this.dispatch.getLogs({ ...filter, topics: [null, null, null, topic] });

    [logs1, logs2, logs3] = await Promise.all([logs1, logs2, logs3]);

    return [...logs1, ...logs2, ...logs3];
  }

  static addTxEvtId(e) {
    e.txId = e.blockNumber * 1e6 + e.transactionIndex * 10;
    e.evtId = e.txId + e.logIndex;
    return e;
  }

  async getTxTimestamp(e) {
    const block = await this.dispatch.getBlock(e.blockNumber);
    return block.timestamp;
  }

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
      evt, a, user, referrer, sender, isReferral, isAssist,
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
