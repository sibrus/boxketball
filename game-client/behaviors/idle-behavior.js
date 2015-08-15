var _ = require('lodash');
var Behavior = require('./behavior');

var IdleBehavior = Behavior.extend({
  processMessage: function(channel, payload) {
    console.log('IdleBehavior got message');
    if (payload.msg === 'buttonPress') {
      this.transitionTo('blink');
    }
  }
});

module.exports = IdleBehavior;