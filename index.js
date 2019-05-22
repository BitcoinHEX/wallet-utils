const ethers = require('ethers');
const Claim = require('./claim');
const Contract = require('./contract');
const Token = require('./token');
const Stake = require('./stake');
const Transform = require('./transform');
const Dispatch = require('./dispatch');

class Utils {
  constructor(contractAddress, abi, contractStartDateMillis, network, networkProvider) {
    const contractState = new Contract(contractStartDateMillis);
    this.claim = new Claim(contractState);
    this.token = new Token(contractState);
    this.stake = new Stake(contractState);
    this.transform = new Transform(contractState);
    const simulator = Object.assign({}, this.claim, this.token, this.stake, this.transform);

    const np = networkProvider || ethers.getDefaultProvider(network);

    this.dispatch = new Dispatch(contractAddress, abi, np, simulator);
  }
}

module.exports = Utils;
