class Token {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  balance() {
    return this.dispatcher.buildProxy('balanceOf', []);
  }

  transfer(toAddr, amt) {
    return this.dispatcher.buildProxy('transfer', [toAddr, amt]);
  }
}

module.exports = Token;
