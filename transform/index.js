const { AddressZero } = require('ethers/constants');

class Transform {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  // Probably best to build this from join events given the API
  static getTransformLobbies() {}

  enterTransformLobby(rawAmount, referrer) {
    return this.dispatcher.buildProxy('joinXfLobby', [
      referrer || AddressZero,
      {
        value: rawAmount,
      }]);
  }

  leaveTransformLobby(joinDay, count) {
    return this.dispatcher.buildProxy('leaveXfLobby',
      [
        joinDay,
        count || 0,
      ]);
  }
}

module.exports = Transform;
