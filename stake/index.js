class Stake {
    _startTimeMillis;

    constructor(contractStartTimeMillis){
        this._startTimeMillis = contractStartTimeMillis;
    }

    startStake(newStakedHearts, newStakedDays){}

    // goodAccounting(stakerAddr, stakeIndex, stakeIdParam){} - not useful to sim?

    endStake(stakeIndex, stakeIdParam){}

    // getStakeCount(ethAddr){} - not useful to sim?
};

module.exports = Stake;
