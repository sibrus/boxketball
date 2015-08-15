var requireRoot = require('app-root-path').require;

var Behavior = require('./behavior');
var baskets = requireRoot('/data/baskets');
var reset = requireRoot('/animations/reset');

var BlinkBehavior = Behavior.extend({
  initHook: function() {
    reset(this, 'basketOff', baskets);
  },
  processMessage: function(channel, payload) {
    console.log('BlinkBehavior got message');
    var self = this;
    if (payload.msg === 'basketHit') {
      self.basketOn(payload.data);
      setTimeout(function() {
        self.basketOff(payload.data);
      }, 300);
    } else if (payload.msg === 'hoopHit') {
      self.hoopOn();
      setTimeout(function() {
        self.hoopOff();
      }, 300);
    } else if (payload.msg === 'reboundHit') {
      self.reboundOn();
      setTimeout(function() {
        self.reboundOff();
      }, 300);
    } else if (payload.msg === 'buttonPress') {
      if (payload.data >= 0 && payload.data < 4) {
        self.buttonOn(payload.data);
        setTimeout(function() {
          self.buttonOff(payload.data);
        }, 300);
      }
      if (payload.data == 4) {
        self.indicatorOn(5);
        setTimeout(function() {
          self.indicatorOff(5);
        }, 300);
      }
      if (payload.data == 5) {
        self.indicatorOn(6);
        setTimeout(function() {
          self.indicatorOff(6);
        }, 300);
      }
      if (payload.data == 6) {
        self.transitionTo('idle');
      }
    }
  }
});


module.exports = BlinkBehavior;