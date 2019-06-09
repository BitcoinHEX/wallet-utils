const ethers = require('ethers');

async function signer(contract, provider, addr) {
  return contract.connect(provider.getSigner(addr));
}

class Dispatcher {
  constructor(abi, contractAddress, networkProvider, contractProvider) {
    this.address = contractAddress;
    this.provider = networkProvider;
    this.interface = new ethers.utils.Interface(abi);
    // Contract provider is an optional user provided object for testing/mock
    this.contract = contractProvider !== undefined ? contractProvider
      : new ethers.Contract(contractAddress, abi, this.provider);
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

  callConstant(method, args) {
    const contractFunction = this.interface.functions[method];
    if (contractFunction.type !== 'call') {
      return Promise.reject(new Error(`method ${method} is not 'call' type.`));
    }

    const tx = {
      to: this.address,
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

  subscribe(event, callback) {
    this.contract.on(event, callback);
  }
}

module.exports = Dispatcher;
