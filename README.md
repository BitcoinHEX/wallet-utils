# Hex Wallet Utils

Architecture:
- Util functions:
  - Take input
  - Do utility
  - Return
- Contract functions:
  - Take Input
  - Calculate parameters to be passed to contract
  - If applicable, simulate contract call locally
  - Return in format:
```json
{
  call: {"params passed to contract"},
  result: {"simulated contract output"},
  submit: function("Send transaction on-chain")
}
```

TODO: Fill out README