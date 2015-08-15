global.Promise = require('bluebird');
global._ = require('lodash');
var Manager = require('./manager');

var managerInstance = new Manager();
managerInstance.init();