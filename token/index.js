const ethers = require('ethers');

class Token {
    _startTimeMillis;
    constructor(contractStartDateMillis){
        this._startTimeMillis = contractStartDateMillis;
    }

    // getGlobalInfo(){}, Not useful or possible to simulate this?

    getCurrentDay(){
        const now = Date.now();
        if(now < this._startTimeMillis){
            throw new Error('Current day earlier than contract launch');
        }
        return ethers.utils.bigNumberify(Math.floor(Math.abs(now - this._startTimeMillis) / (1000 * 86400)));
    }
};

module.exports = Token;
