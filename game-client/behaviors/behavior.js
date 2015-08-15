var _ = require('lodash');
var BaseClass = require('base-class');

var Behavior = BaseClass.extend({
  init: function() {
    this.owner = this.options.owner;
    this.isDestroyed = false;
    _.bindAll(this);
  },
  publish: function(channel, payload) {
    if (!this.isDestroyed) {
      this.owner.publish(channel, payload);
    } else {
      console.log('Warning: destroyed behavior trying to publish...');
    }
  },
  transitionTo: function(behavior) {
    if (!this.isDestroyed) {
      this.owner.transitionTo(behavior);
    } else {
      console.log('Warning: destroyed behavior trying to transition...');
    }
  },
  destroy: function() {
    this.owner = null;
    this.isDestroyed = true;
    this.options = null;
  }
});

module.exports = Behavior;