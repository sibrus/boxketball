var _ = require('lodash');
var Client = require('./client');

var BoxketballGame = require('./behaviors/boxketball-game');
var IdleBehavior = require('./behaviors/idle-behavior');
var BlinkBehavior = require('./behaviors/blink-behavior');

var Manager = function() {  
  _.bindAll(this);
};

Manager.prototype = {
  init: function() {
    this.client = new Client(this);
    this.behaviors = {
      boxketball: BoxketballGame,
      idle: IdleBehavior,
      blink: BlinkBehavior
    }
    this.transitionTo('idle');
  },
  transitionTo: function(behavior) {
    if (this.currentBehavior != null) {
      this.currentBehavior.destroy();
    }
    console.log('Will transition to: ' + behavior);
    this.currentBehavior = new this.behaviors[behavior]({owner: this});
  },
  publish: function(channel, payload) {
    this.client.publish(channel, payload);
  },
  processMessage: function(channel, payload) {
    if (this.currentBehavior != null) {
      this.currentBehavior.processMessage(channel, payload);
    } else {
      console.log('Could not process message - no currentBehavior');
    }
  }
};

module.exports = Manager;