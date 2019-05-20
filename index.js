const claim = require('./claim');
const token = require('./token');
const stake = require('./stake');
const transform = require('./transform');
const Dispatch = require('./dispatch');

class Utils {
  constructor(contractAddress, network, contractStartDateMillis) {
    this.claim = claim;
    this.token = token(contractStartDateMillis);
    this.stake = stake;
    this.transform = transform;
    const simulator = Object.assign({}, this.claim, this.token, this.stake, this.transform);
    this.dispatch = new Dispatch(contractAddress, network, simulator);
  }
}

module.exports = Utils;
