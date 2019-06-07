const spec = {
  token: {
    balance() {},
    transfer() {},
  },
  claim: {
    getUnclaimed() {},
    getSignMessage() {},
    claim() {},
  },
  stake: {
    getStakes() {},
    startStake() {},
    endStake() {},
    emergencyUnstake() {},
  },
  transform: {
    getTransformLobbys() {},
    enterTransFormLobby() {},
  },
};

module.exports = spec;
