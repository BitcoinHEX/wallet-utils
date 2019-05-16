const assert = require('assert');
const hexUtils = require('../index');

describe('claim', () => {
  describe('getClaimStatement()', () => {
    it('shold return the correct claim statement', () => {
      assert.equal(hexUtils.claim.getClaimStatement('0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE'), 'Claim_HEX_to_0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE');
    });
  });
});
