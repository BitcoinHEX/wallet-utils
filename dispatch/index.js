const ethers = require('ethers');

class Dispatcher {
  constructor(contractAddress, network, contractSimulator) {
    const abi = [
      'event ValueChanged(address indexed author, string oldValue, string newValue)',
      'constructor(string value)',
      'function getValue() view returns (string value)',
      'function setValue(string value)',
    ];

    this.provider = ethers.getDefaultProvider(network);

    this.contract = new ethers.Contract(contractAddress, abi, this.provider);
    this.simulator = contractSimulator;
  }

  buildProxy(method, args){
      const contractFunction = this.contract.interface.functions[method];
      let simFunction;
      let gasCost;
      if(contractFunction.type === 'call'){
          simFunction = this.provider.call;
          gasCost = () => Promise.resolve(ethers.utils.bigNumberify(0));
      } else {
          simFunction = () => this.simulator[method](args); // ignore tx data, use raw args for ease
          gasCost = this.provider.estimateGas;
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
          getGasCost: () => gasCost(tx),
          simulate: () => simFunction(tx),
          submit: wallet => this.contract.connect(wallet)[method](args),
      };
  }

  callConstant(method, args) {
      const contractFunction = this.contract.interface.functions[method];
      if(contractFunction.type !== 'call'){
          return Promise.reject(new Error('method ' + method + ' is not `call` type.'));
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
