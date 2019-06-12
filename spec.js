const spec = {
  token: {
    balance() {},
    transfer() {},
  },
  claim: {
    getUnclaimed() {},
    getSignMessage() {},
    claim() {},
    estimateClaim() {},
  },
  stake: {
    getStakes() {},
    startStake() {},
    endStake() {},
    estimateReturn() {},
    emergencyUnstake() {},
  },
  transform: {
    getTransformLobbies() {},
    enterTransFormLobby() {},
  },
};

module.exports = spec;
