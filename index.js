const ethers = require('ethers');

const { abi } = require('./abi');
const Claim = require('./claim');
const Token = require('./token');
const Stake = require('./stake');
const Transform = require('./transform');
const Dispatch = require('./dispatch');
const Utils = require('./utils');

class HexClient {
  constructor(contractAddress,
    network,
    networkProvider,
    contractStateProvider) {
    // Optional user provided network provider to mock the network for testing
    const np = networkProvider || ethers.getDefaultProvider(network);
    this.dispatch = new Dispatch(abi, contractAddress, np, contractStateProvider);

    const claim = new Claim(this.dispatch);
    const token = new Token(this.dispatch);
    const stake = new Stake(this.dispatch);
    const transform = new Transform(this.dispatch);
    Object.assign(this, claim, token, stake, transform);
    this.utilities = Utils;
  }
}

module.exports = HexClient;
