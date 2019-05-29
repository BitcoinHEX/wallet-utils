const ethers = require('ethers');

function noSuchMethod(method) {
  return () => `No such simulation method ${method} exists`;
}

class Dispatcher {
  constructor(abi, contractSimulator, contractProvider, contractAddress, networkProvider) {
    /*
      Example format
      const abi = [
        'event ValueChanged(address indexed author, string oldValue, string newValue)',
        'constructor(string value)',
        'function getValue() view returns (string value)',
        'function setValue(string value)',
      ];
    */

    this.address = contractAddress;
    this.provider = networkProvider;
    this.interface = new ethers.utils.Interface(abi);
    // Contract provider is a function that returns a contract - mostly a testing/mock utility
    if (contractProvider) {
      this.contractProvider = contractProvider;
    } else {
      this.contract = new ethers.Contract(contractAddress, abi, this.provider);
    }
    this.simulator = contractSimulator;
  }

  buildProxy(method, args) {
    const contractFunction = this.interface.functions[method];
    let simFunction;
    let gasCost;
    if (contractFunction.type === 'call') {
      simFunction = () => this.provider.call(...args);
      gasCost = () => Promise.resolve(ethers.utils.bigNumberify(0));
    } else {
      // ignore tx data, use raw args for ease
      simFunction = () => (this.simulator[method] || noSuchMethod(method))(...args);
      gasCost = this.provider.estimateGas;
    }

    const tx = {
      to: this.address,
      nonce: 0,
      gasLimit: 0,
      gasPrice: 0,
      data: contractFunction.encode(args),
    };

    return {
      callData: args,
      transaction: tx,
      getGasCost: () => gasCost(tx),
      simulate: () => simFunction(tx),
      submit: wallet => (this.contractProvider ? this.contractProvider()
        : this.contract)
        .connect(wallet)[method](...args),
    };
  }

  callConstant(method, args) {
    const contractFunction = this.contract.interface.functions[method];
    if (contractFunction.type !== 'call') {
      return Promise.reject(new Error(`method ${method} is not 'call' type.`));
    }

    const tx = {
      to: this.contract.address,
      nonce: 0,
      gasLimit: 0,
      gasPrice: 0,
      data: contractFunction.encode(args),
    };

    return this.provider.call(tx);
  }

  callActive(method, args, wallet) {
    this.buildProxy(method, args).submit(wallet);
  }

  simulateCall(method, args) {
    // Use callConstant to simulate call
    // https://github.com/ethereum/interfaces/issues/8
    // https://ethereum.stackexchange.com/questions/765/what-is-the-difference-between-a-transaction-and-a-call
    return this.buildProxy(method, args).simulate();
  }

  subscribe(event, callback) {
    this.contract.on(event, callback);
  }
}

module.exports = Dispatcher;
