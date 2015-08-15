var requireRoot = require('app-root-path').require;

var Behavior = require('./behavior');
var cycleBaskets = requireRoot('/animations/cycle-baskets');
var resetAll = requireRoot('/animations/reset-all');

var IdleBehavior = Behavior.extend({
  initHook: function() {
    resetAll(this);
    this.cycler = cycleBaskets(this, [0, 1, 2, 3], 500, true);
    this.cycler2 = cycleBaskets(this, [6, 7, 4, 5], 500, true);
  },
  destroyHook: function() {
    this.cycler.cancel('parent destroyed');
    this.cycler = null;
    this.cycler2.cancel('parent destroyed');
    this.cycler2 = null;
  },
  processMessage: function(channel, payload) {
    console.log('IdleBehavior got message');
    if (payload.msg === 'buttonPress') {
      if (payload.data == 6) {
        this.transitionTo('blink');
      } else {
        this.transitionTo('boxketball');
      }
    }
  }
});

module.exports = IdleBehavior;