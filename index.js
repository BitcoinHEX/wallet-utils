const ethers = require('ethers');

const Claim = require('./claim');
const Contract = require('./contract');
const Token = require('./token');
const Stake = require('./stake');
const Transform = require('./transform');
const Dispatch = require('./dispatch');
const Api = require('./api');
const Utils = require('./utils');

const abi = require('./abi');

class HexClient {
  constructor(contractAddress,
    simplifiedEvents,
    simplifiedFunctions,
    contractStartDateMillis,
    contractStateProvider,
    network,
    networkProvider) {
    const contractState = contractStateProvider || new Contract(contractStartDateMillis);
    const claim = new Claim(contractState);
    const token = new Token(contractState);
    const stake = new Stake(contractState);
    const transform = new Transform(contractState);
    const simulator = Object.assign({}, claim, token, stake, transform);
    const np = networkProvider || ethers.getDefaultProvider(network);
    // This is the real client API in my mind - whatever utilities, the raw dispatcher, and the
    // simplified client API that wraps for convenience
    this.utilities = Utils;
    this.dispatch = new Dispatch(abi, simulator, contractState, contractAddress, np);
    this.simpleApi = new Api(this.dispatch, abi, simplifiedEvents, simplifiedFunctions);
  }
}

module.exports = HexClient;
