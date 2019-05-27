const Utils = require('../utils');

class Api {
  constructor(dispatch, abi, eventsOfInterest, functionsOfInterest) {
    const simplifiedApi = Utils.extractSimplifiedApi(abi, eventsOfInterest, functionsOfInterest);
    this.events = {};
    this.functions = {};
    Object.keys(simplifiedApi.events).map((evt) => {
      this.events[evt] = {
        fields: simplifiedApi.events[evt].fields,
        addEventListener: callback => dispatch.subscribe(evt, callback),
      };
      return null;
    });

    Object.keys(simplifiedApi.functions).map((fn) => {
      this.functions[fn] = {
        inputs: simplifiedApi.functions[fn].inputs,
        prepare: args => dispatch.buildProxy(fn, args),
      };
      return null;
    });
  }
}

module.exports = Api;
