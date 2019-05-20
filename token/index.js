const ethers = require('ethers');

const token = (contractStartDateMillis) => {
    return {
        // getGlobalInfo: () => {}, Not useful or possible to simulate this?
        getCurrentDay: () => Promise.resolve(ethers.utils.bigNumberify(Math.floor(Math.abs(Date.now() - contractStartDateMillis) / (1000 * 86400)))),
    };
};

module.exports = token;
