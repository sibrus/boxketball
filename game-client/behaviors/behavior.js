var requireRoot = require('app-root-path').require;

var BaseClass = require('base-class');
var baskets = requireRoot('/data/baskets');
var buttons = requireRoot('/data/buttons');
var indicators = requireRoot('/data/indicators');
var switches = requireRoot('/data/switches');

var Behavior = BaseClass.extend({
  init: function() {
    this.owner = this.options.owner;
    this.isDestroyed = false;
    _.bindAll(this);
    if (typeof(this.initHook) === 'function') {
      this.initHook();
    }
  },
  hoopOn: function() {
    this.publish('box.raw.input', { msg: 'hoopOn' });
  },
  hoopOff: function() {
    this.publish('box.raw.input', { msg: 'hoopOff' });
  },
  reboundOn: function() {
    this.publish('box.raw.input', { msg: 'reboundOn' });
  },
  reboundOff: function() {
    this.publish('box.raw.input', { msg: 'reboundOff' });
  },
  getButtonObj: function(button) {
    if (typeof(button) === 'number') {
      return buttons[number];
    } else if (typeof(button) === 'string') {
      return _.find(buttons, function(x) { return x.key == button; });
    } else {
      return button;
    }
  },
  buttonOn: function(button) {    
    var buttonObj = this.getButtonObj(button);
    var indicator = buttonObj.indicator;
    if (typeof(indicator) === 'number') {
      this.publish('box.raw.input', { msg: 'indicatorOn', data: indicator });
    }
  },
  buttonOff: function(button) {
    var buttonObj = this.getButtonObj(button);
    var indicator = buttonObj.indicator;
    if (typeof(indicator) === 'number') {
      this.publish('box.raw.input', { msg: 'indicatorOff', data: indicator });
    }
  },
  switchOn: function(switchVal) {
    var switchObj = (typeof(switchVal) === 'number') ? switches[switchVal] : switchVal;
    var indicator = switchObj.indicator;
    if (typeof(indicator) === 'number') {
      this.publish('box.raw.input', { msg: 'indicatorOn', data: indicator });
    }
  },
  switchOff: function(switchVal) {
    var switchObj = (typeof(switchVal) === 'number') ? switches[switchVal] : switchVal;
    var indicator = switchObj.indicator;
    if (typeof(indicator) === 'number') {
      this.publish('box.raw.input', { msg: 'indicatorOff', data: indicator });
    }
  },
  basketOn: function(basket) {
    var basketObj = (typeof(basket) === 'number') ? baskets[basket] : basket;
    this.publish('box.raw.input', { msg: 'basketOn', data: basketObj.number });
  },
  basketOff: function(basket) {
    var basketObj = (typeof(basket) === 'number') ? baskets[basket] : basket;
    this.publish('box.raw.input', { msg: 'basketOff', data: basketObj.number });
  },
  getIndicatorObj: function(indicator) {
    if (typeof(indicator) === 'number') {
      return indicators[number];
    } else if (typeof(indicator) === 'string') {
      return _.find(indicators, function(x) { return x.key == indicator; });
    } else {
      return indicator;
    }
  },
  indicatorOn: function(indicator) {
    var indicatorObj = this.getIndicatorObj(indicator);
    this.publish('box.raw.input', { msg: 'indicatorOn', data: indicatorObj.number });
  },
  indicatorOff: function(indicator) {
    var indicatorObj = this.getIndicatorObj(indicator);
    this.publish('box.raw.input', { msg: 'indicatorOff', data: indicatorObj.number });
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
    if (typeof(this.destroyHook) === 'function') {
      this.destroyHook();
    }
    this.owner = null;
    this.isDestroyed = true;
    this.options = null;
  }
});

module.exports = Behavior;