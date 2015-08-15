var _ = require('lodash');
var Behavior = require('./behavior');

var BlinkBehavior = Behavior.extend({
  processMessage: function(channel, payload) {
    console.log('BlinkBehavior got message');
    var self = this;
    if (payload.msg === 'basketHit') {
      self.publish('box.raw.input', { msg: 'basketOn', data: payload.data });
      setTimeout(function() {
        self.publish('box.raw.input', { msg: 'basketOff', data: payload.data });
      }, 300);
    } else if (payload.msg === 'hoopHit') {
      self.publish('box.raw.input', { msg: 'hoopOn' });
      setTimeout(function() {
        self.publish('box.raw.input', { msg: 'hoopOff' });
      }, 300);
    } else if (payload.msg === 'reboundHit') {
      self.publish('box.raw.input', { msg: 'reboundOn', data: payload.data });
      setTimeout(function() {
        self.publish('box.raw.input', { msg: 'reboundOff', data: payload.data });
      }, 300);
    } else if (payload.msg === 'buttonPress') {
      if (payload.data >= 0 && payload.data < 4) {
        self.publish('box.raw.input', { msg: 'indicatorOn', data: payload.data });
        setTimeout(function() {
          self.publish('box.raw.input', { msg: 'indicatorOff', data: payload.data });
        }, 300);
      }
      if (payload.data == 5) {
        self.publish('box.raw.input', { msg: 'indicatorOn', data: 4 });
        setTimeout(function() {
          self.publish('box.raw.input', { msg: 'indicatorOff', data: 4 });
        }, 300);
      }
      if (payload.data == 6) {
        self.publish('box.raw.input', { msg: 'indicatorOn', data: 5 });
        setTimeout(function() {
          self.publish('box.raw.input', { msg: 'indicatorOff', data: 5 });
        }, 300);
      }
      if (payload.data == 10) {
        self.transitionTo('idle');
      }
    } else if (payload.msg === 'switchOn') {
        self.publish('box.raw.input', { msg: 'indicatorOn', data: 3 });
    } else if (payload.msg === 'switchOff') {
        self.publish('box.raw.input', { msg: 'indicatorOff', data: 3 });
    }
  }
});


module.exports = BlinkBehavior;