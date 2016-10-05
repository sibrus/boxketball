global.Promise = require('bluebird');
global._ = require('lodash');

var Random = require('random-js');
global.rand = new Random(Random.engines.browserCrypto);

var Manager = require('./manager');

var managerInstance = new Manager();
managerInstance.init();