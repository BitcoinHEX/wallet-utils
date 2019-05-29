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


## Construction
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

## API

### utilities

The only method of note for runtime use is `processDailyRangeData`.

This processes the contract return from the function `getDailyDataRange` which returns an array of packed integers (unclaimed satoshis | total shares | total hearts) and returns an array of objects with the values broken out

### dispatch

#### buildProxy

`hexClient.dispatch.buildProxy('someContractMethod', [...args])`

Builds a proxy object that exposes details about the pending operation and has methods to invoke against the Ethereum network or simulate the call (if able):

```angular2html
{
  callData: args,
  transaction: tx,
  getGasCost: () => gasCost(tx),
  simulate: () => simFunction(tx),
  submit: wallet => this.contract.connect(wallet)[method](...args),
};
```

#### callConstant
`hexClient.dispatch.callConstant('someContractMethod', [...args])`

Only works for `call` type methods on the contract (pure or view I believe) - essentially reads data only. It invokes immediately, no intermediate object.

#### callActive
`hexClient.dispatch.callActive('someContractMethod', [...args], wallet)`

Submits a transaction to the network for a contract function. It invokes immediately, no intermediate object.

#### simulateCall
`hexClient.dispatch.simulateCall('someContractMethod', [...args])`

There are only a small subset of methods (`claimBtcAddress` and `endStake` at the moment) that can be usefully simulated without touching the Ethereum network. For those, this will invoke the simulation for the given arguments.

#### subscribe
`hexClient.dispatch.subscribe('EventName', callback)`

Adds an event listener for a contract event by name

### simpleAPI

This is a generated object that is comprised of the API as generated from the contract's exported ABI. The methods and events in the `simpleApi` give a type definition of the arguments in the `inputs` field and have a function to `prepare` a proxy object for invocation. This function takes an arguments array and returns a proxy object a la the `dispatch` buildProxy method. Events' `addEventListener` take a callback.

```angular2html
Example simpleApi object

{
  events: {
    StartStake: { fields: [Array], addEventListener: [Function: addEventListener] },
    EndStake: { fields: [Array], addEventListener: [Function: addEventListener] }
  },
  functions: {
    startStake: { inputs: [Array], prepare: [Function: prepare] },
    getCurrentDay: { inputs: [], prepare: [Function: prepare] },
    balanceOf: { inputs: [Array], prepare: [Function: prepare] },
    endStake: { inputs: [Array], prepare: [Function: prepare] },
    staked: { inputs: [Array], prepare: [Function: prepare] },
    claimBtcAddress: { inputs: [Array], prepare: [Function: prepare] },
    getDailyDataRange: { inputs: [Array], prepare: [Function: prepare] },
    getGlobalInfo: { inputs: [], prepare: [Function: prepare] }
  }
}

```


