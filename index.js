const ethers = require('ethers');

const { defaultAbi } = require('./abi');
const Claim = require('./claim');
const Token = require('./token');
const Stake = require('./stake');
const Transform = require('./transform');
const Dispatch = require('./dispatch');
const Events = require('./events');
const Utils = require('./utils');

class HexClient {
  constructor(contractAddress,
    network,
    networkProvider,
    abi,
    contract) {
    // Optional user provided network provider to mock the network for testing
    const np = networkProvider || ethers.getDefaultProvider(network);
    const contractAbi = abi || defaultAbi;
    const iface = new ethers.utils.Interface(contractAbi);
    this.dispatch = new Dispatch(contractAddress, np, iface, contract);
    const claim = new Claim(this.dispatch);
    const stake = new Stake(this.dispatch);
    const token = new Token(this.dispatch);
    const transform = new Transform(this.dispatch);
    Object.assign(this, claim, stake, token, transform);
    // direct fields for use
    this.events = new Events(contractAddress, iface, this.dispatch);
    this.utils = Utils;
    this.interface = iface;
    this.contractAddress = contractAddress;
  }
}

module.exports = HexClient;
