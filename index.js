const claim = require('./claim');
const token = require('./token');
const stake = require('./stake');
const transform = require('./transform');
const Dispatch = require('./dispatch');

class Utils {
  constructor(contractAddress, network) {
    this.claim = claim;
    this.token = token;
    this.stake = stake;
    this.transform = transform;
    this.dispatch = new Dispatch(contractAddress, network);
  }
}

module.exports = Utils;
