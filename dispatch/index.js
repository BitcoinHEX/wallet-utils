const ethers = require('ethers');

class Dispatcher {
  constructor(contractAddress, network) {
    const abi = [
      'event ValueChanged(address indexed author, string oldValue, string newValue)',
      'constructor(string value)',
      'function getValue() view returns (string value)',
      'function setValue(string value)',
    ];

    this.provider = ethers.getDefaultProvider(network);

    this.contract = new ethers.Contract(contractAddress, abi, provider);
  }

  doStuff(method, args){
      const contractFunction = this.contract.interface.functions[method];
      let simFunction;
      if(contractFunction.type === 'call'){
          simFunction = this.provider.call;
      } else {
          simFunction = this.provider.estimateGas;
      }

      const tx = {
          to: this.contract.address,
          nonce: 0,
          gasLimit: 0,
          gasPrice: 0,
          data: contractFunction.encode(args),
      };

      return {
          callData: args,
          transaction: tx,
          simulate: () => simFunction(tx),
          submit: (wallet) => this.contract.connect(wallet)[method](args),
      };
  }

  callConstant(method, args) {}

  callActive(method, args) {}

  simulateCall(method, args) {
    // Use callConstant to simulate call
    // https://github.com/ethereum/interfaces/issues/8
    // https://ethereum.stackexchange.com/questions/765/what-is-the-difference-between-a-transaction-and-a-call
  }

  subscribe(event, callback) {
    this.contract.on(event, callback);
  }
}

module.exports = Dispatcher;
