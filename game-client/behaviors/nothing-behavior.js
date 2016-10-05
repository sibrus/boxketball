var requireRoot = require('app-root-path').require;

var Behavior = require('./behavior');
var resetAll = requireRoot('/animations/reset-all');

var NothingBehavior = Behavior.extend({
  initHook: function() {
    resetAll(this);
  },
  processMessage: function(channel, payload) {
  }
});

module.exports = NothingBehavior;