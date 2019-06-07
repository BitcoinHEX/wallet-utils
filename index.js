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
    const claim = new Claim();
    const token = new Token();
    const stake = new Stake();
    const transform = new Transform();
    Object.assign(this, claim, token, stake, transform);
    // Optional user provided network provider to mock the network for testing
    const np = networkProvider || ethers.getDefaultProvider(network);
    this.utilities = Utils;
    this.dispatch = new Dispatch(abi, contractAddress, np, contractStateProvider);
  }
}

module.exports = HexClient;
