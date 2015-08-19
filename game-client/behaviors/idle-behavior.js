var requireRoot = require('app-root-path').require;

var Behavior = require('./behavior');
var cycleBaskets = requireRoot('/animations/cycle-baskets');
var resetAll = requireRoot('/animations/reset-all');

var IdleBehavior = Behavior.extend({
  initHook: function() {
    resetAll(this);
    this.cycler1 = cycleBaskets(this, [4, 0, 1, 2, 3], 500, true);
    this.cycler2 = cycleBaskets(this, [8, 9, 5, 6, 7], 500, true);
    this.cycler3 = cycleBaskets(this, [12, 13, 14, 10, 11], 500, true);
  },
  destroyHook: function() {
    this.cycler1.cancel('parent destroyed');
    this.cycler1 = null;
    this.cycler2.cancel('parent destroyed');
    this.cycler2 = null;
    this.cycler3.cancel('parent destroyed');
    this.cycler3 = null;
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