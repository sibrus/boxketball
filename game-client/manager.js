var _ = require('lodash');
var Client = require('./client');

var BoxketballGame = require('./behaviors/boxketball-game');
var ScoreAttack = require('./behaviors/score-attack');
var IdleBehavior = require('./behaviors/idle-behavior');
var BlinkBehavior = require('./behaviors/blink-behavior');
var NothingBehavior = require('./behaviors/nothing-behavior');
var buttons = require('./data/buttons');
var baskets = require('./data/baskets');

var Manager = function() {  
  _.bindAll(this);
};

Manager.prototype = {
  init: function() {
    this.client = new Client(this);
    this.behaviors = {
      boxketball: BoxketballGame,
      idle: IdleBehavior,
      blink: BlinkBehavior,
      nothing: NothingBehavior,
      scoreattack: ScoreAttack
    }
    this.transitionTo('idle');
  },
  transitionTo: function(behavior) {
    if (this.currentBehavior != null) {
      this.currentBehavior.destroy();
    }
    console.log('Will transition to: ' + behavior);
    this.publishEvent('transition', behavior);
    this.currentBehavior = new this.behaviors[behavior]({owner: this});
  },
  publishEvent: function(event, data) {
    this.publish('box.events', { event: event, data: data });
  },
  publish: function(channel, payload) {
    this.client.publish(channel, payload);
  },
  processMessage: function(channel, payload) {
    if (channel == 'box.raw.output' && payload.msg == 'buttonPress') {
      payload.button = buttons[payload.data];
      if (payload.button.key == 'soft_reset') {
        this.transitionTo('idle');
        return;
      }
      if (payload.button.key == 'hard_reset') {
        process.exit(1);
      }
    }
    if (channel == 'box.raw.output' && payload.msg == 'basketHit') {
      payload.basket = baskets[payload.data];
    }
    if (channel == 'box.raw.output' && payload.msg == 'switchOn' && payload.data == 0) {
      this.transitionTo('nothing');
      return;
    }
    if (channel == 'box.raw.output' && payload.msg == 'switchOff' && payload.data == 0) {
      this.transitionTo('idle');
      return;
    }
    if (this.currentBehavior != null) {
      this.currentBehavior.processMessage(channel, payload);
    } else {
      console.log('Could not process message - no currentBehavior');
    }
  }
};

module.exports = Manager;