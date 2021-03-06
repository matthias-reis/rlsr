const R = require('ramda');
const env = {
  dbg: () => {},
  log: () => {},
  appRoot: '/',
  mainPackage: {
    version: '1.8.5',
    rlsr: {},
  },
  consts: {
    nsp: 'rlsr',
    rlsrLatest: 'rlsr-latest',
    levels: ['patch', 'minor', 'major'],
  },
  messages: [],
  config: {
    mode: 'synchronized',
  },
  packages: {
    one: {
      name: 'one',
      version: '1.2.3',
      dependencies: {
        four: '^4.5.0',
        five: '^4.5.0',
      },
    },
    two: {
      name: 'two',
      version: '2.3.4',
      dependencies: {
        three: '2.3.4 - 3',
      },
    },
    three: {
      name: 'three',
      version: '3.4.5',
      dependencies: {
        four: '4.0.0 - 4.5.6',
      },
    },
    four: {
      name: 'four',
      version: '4.5.6',
    },
    five: {
      name: 'five',
      version: '4.5.6',
    },
  },
  changelog: {},
};

module.exports = (messages) =>
  R.clone(Object.assign(R.clone(env), { messages }));
