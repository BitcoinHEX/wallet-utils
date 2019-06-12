const ethers = require('ethers');

async function signer(contract, provider, addr) {
  return contract.connect(provider.getSigner(addr));
}

class Dispatcher {
  constructor(contractAddress, networkProvider, iface, contract) {
    this.address = contractAddress;
    this.provider = networkProvider;
    this.interface = contract ? contract.interface : iface;
    // Contract provider is an optional user provided object for testing/mock
    this.contract = contract !== undefined ? contract
      : new ethers.Contract(contractAddress, iface, this.provider);
  }

  async getLogs(filters) {
    return this.provider.getLogs(filters);
  }

  async getBlock(n) {
    return this.provider.getBlock(n);
  }

  buildProxy(method, args) {
    const contractFunction = this.interface.functions[method];

    const t = {
      to: this.address,
      nonce: 0,
      gasLimit: 0,
      gasPrice: 0,
      data: contractFunction.encode(args),
    };

    return {
      callData: args,
      transaction: t,
      submit: async (addr) => {
        const tx = await signer(this.contract, this.provider, addr)[method](...args);
        const txRcpt = await tx.wait();
        return txRcpt;
      },
    };
  }

  async callConstant(method, args) {
    const contractFunction = this.interface.functions[method];
    if (contractFunction.type !== 'call') {
      return Promise.reject(new Error(`method ${method} is not 'call' type.`));
    }

    return this.contract[method](...args);
  }

  callActive(method, args, addr) {
    return this.buildProxy(method, args).submit(addr);
  }

  subscribe(event, callback) {
    this.contract.on(event, callback);
  }

  removeAllListeners(event) {
    this.contract.removeAllListeners(event);
  }

  subscribeOnError(callback) {
    this.provider.on('error', callback);
  }

  removeAllErrorListeners() {
    this.provider.removeAllListeners('error');
  }
}

module.exports = Dispatcher;
