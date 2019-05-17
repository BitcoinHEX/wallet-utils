const ethers = require('ethers');

class Dispatcher {
  constructor(contractAddress, network) {
    const abi = [
      'event ValueChanged(address indexed author, string oldValue, string newValue)',
      'constructor(string value)',
      'function getValue() view returns (string value)',
      'function setValue(string value)',
    ];

    const provider = ethers.getDefaultProvider(network);

    this.contract = new ethers.Contract(contractAddress, abi, provider);
  }

  callConstant(method, arguments) {

  }

  callActive(method, arguments) {

  }

  simulateCall(method, arguments) {
    // Use callConstant to simulate call
    // https://github.com/ethereum/interfaces/issues/8
    // https://ethereum.stackexchange.com/questions/765/what-is-the-difference-between-a-transaction-and-a-call
  }

  subscribe(event, callback) {
    this.contract.on(event, callback);
  }
}

module.exports = Dispatcher;
