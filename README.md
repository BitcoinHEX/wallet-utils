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
  "call": {"params passed to contract"},
  "result": {"simulated contract output"},
  "submit": {"function sendTransactionOnChain()"},
}
```

TODO: Fill out README

Prose for now so folks can make progress...

# HexClient

The primary export is a constructor for HexClient
```
  new HexClient(contractAddress,
  abi,
  simplifiedEvents,
  simplifiedFunctions,
  contractStartDateMillis,
  contractStateProvider,
  network,
  networkProvider)  
```

`contractAddress` is only if you want it to dynamically load/lookup the contract  

`abi` is required as we use it to generate the API for convenient use and under the covers AND use it to generate an argument encoder  

`simplifiedEvents`/`simplifiedFunctions` are just filters to pare down the API from the ABI if you want to remove clutter methods/events, e.g. ['StartStake', 'EndStake'] will only produce helpers for the StartStake and EndStake events and ignore the others. They're still useable via the "raw" client, just no convenience methods  

`contractStartDateMillis` (required OR `contractStateProvider`) allows the client to do local time calculations and it's not readable from the contract at this moment  

`contractStateProvider` is the place we keep the state we read from the contract (daily payout data, stake state, etc.) - optional as we have a dummy object that we can create with the `contractStartDateMillis`  

`network` and `networkProvider` are similarly optional but you need one. The `network` will use the underlying *ethers* library to build a networkProvider OR a networkProvider that you inject (you could put in the JsonRPC one to test locally or even {} to stub it out. It's not called except when you actually attempt to make a network call)


