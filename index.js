const ethers = require('ethers');
const Claim = require('./claim');
const Token = require('./token');
const Stake = require('./stake');
const Transform = require('./transform');
const Dispatch = require('./dispatch');

class Utils {
  constructor(contractAddress, contractStartDateMillis, network, networkProvider) {
    this.claim = new Claim(contractStartDateMillis);
    this.token = new Token(contractStartDateMillis);
    this.stake = new Stake(contractStartDateMillis);
    this.transform = new Transform(contractStartDateMillis);
    const simulator = Object.assign({}, this.claim, this.token, this.stake, this.transform);

    const np = networkProvider || ethers.getDefaultProvider(network);
    this.dispatch = new Dispatch(contractAddress, np, simulator);
  }
}

module.exports = Utils;
