const assert = require('assert');
const ethers = require('ethers');
const Claim = require('../claim');
const Utils = require('./testUtilities');

describe('claim', () => {
  describe('getClaimStatement()', () => {
    it('shold return the correct claim statement', () => {
      assert.strictEqual(Claim.getSignMessage('0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE'), 'Claim_HEX_to_0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE');
    });
  });

  describe('estimateClaim', () => {
    it('should return 20% bonus hearts for launch day', () => {
      const hearts = new Claim(Utils.newState())
        .estimateClaim(100,
          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE');
      console.log(hearts.toString());

      // 1.2 (speed) * input * 10,000 (hearts/satoshi) = 1,200,000
      assert.strict(ethers.utils.bigNumberify(1200000).eq(hearts));
    });

    it('should return 50% hearts for launch day minor whale', () => {
      const hearts = new Claim(Utils.newState())
        .estimateClaim(1000e8,
          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE');
      console.log(hearts.toString());

      // 1.2 (speed) * input * 10,000 (hearts/satoshi) * 0.5 (whale) = 1,200,000
      assert.strict(ethers.utils.bigNumberify(600000000000000).eq(hearts));
    });

    it('should return 25% hearts for launch day major whale', () => {
      const hearts = new Claim(Utils.newState())
        .estimateClaim(1e5 * 1e8,
          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE');
      console.log(hearts.toString());

      // 1.2 (speed) * input * 10,000 (hearts/satoshi) * 0.25 (whale)= 1,200,000
      assert.strict(ethers.utils.bigNumberify('30000000000000000').eq(hearts));
    });

    it('should return 32% bonus hearts for non-self refer launch day', () => {
      const hearts = new Claim(Utils.newState())
        .estimateClaim(100,
          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',

          '0x1a5CE5FBFe3E9af3971dD833D26bA9b5C936f0aa');
      console.log(hearts.toString());


      // 1.2 (speed) * input * 10,000 (hearts/satoshi) * 1.3 (self-ref) = 1,560,000
      assert.strict(ethers.utils.bigNumberify(1320000).eq(hearts));
    });

    it('should return 56% bonus hearts for self refer launch day', () => {
      const hearts = new Claim(Utils.newState())
        .estimateClaim(100,
          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',

          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE');
      console.log(hearts.toString());


      // 1.2 (speed) * input * 10,000 (hearts/satoshi) * 1.3 (self-ref) = 1,560,000
      assert.strict(ethers.utils.bigNumberify(1560000).eq(hearts));
    });

    it('should return <100%  hearts for half-way day', () => {
      const hearts = new Claim(Utils.newState(Date.now() - (176 * 1000 * 86400)))
        .estimateClaim(100,
          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE');
      console.log(hearts.toString());

      // 0.5 (late) * (1 + 174/(5*350)) (speed) * input * 10,000 (hearts/satoshi) = 549,714
      assert.strict(ethers.utils.bigNumberify(549714).eq(hearts));
    });

    it('should return <100% hearts for non-self refer half-way day', () => {
      const hearts = new Claim(Utils.newState(Date.now() - (176 * 1000 * 86400)))
        .estimateClaim(100,
          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',

          '0x1a5CE5FBFe3E9af3971dD833D26bA9b5C936f0aa');
      console.log(hearts.toString());


      // 0.5 (late) * (1 + 174/(5*350)) (speed) * input
      // * 10,000 (hearts/satoshi) * 1.1 (other-ref) = 604,685
      assert.strict(ethers.utils.bigNumberify(604685).eq(hearts));
    });

    it('should return <100% hearts for self refer half-way day', () => {
      const hearts = new Claim(Utils.newState(Date.now() - (176 * 1000 * 86400)))
        .estimateClaim(100,
          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',

          '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE');
      console.log(hearts.toString());


      // 0.5 (late) * (1 + 174/(5*350)) (speed) * input
      // * 10,000 (hearts/satoshi) * 1.3 (self-ref) = 714,627 (round down)
      assert.strict(ethers.utils.bigNumberify(714627).eq(hearts));
    });
  });
});
