var requireRoot = require('app-root-path').require;

var Behavior = require('./behavior');
var baskets = requireRoot('/data/baskets');
var buttons = requireRoot('/data/buttons');
var indicators = requireRoot('/data/indicators');
var switches = requireRoot('/data/switches');
var resetAll = requireRoot('/animations/reset-all');

var BoxketballGame = Behavior.extend({
  initHook: function() {
    resetAll(this);
  },
  processMessage: function(channel, payload) {
    console.log('BoxketballGame got message');
  }
});

module.exports = BoxketballGame;