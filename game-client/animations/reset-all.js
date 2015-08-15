var requireRoot = require('app-root-path').require;

var baskets = requireRoot('/data/baskets');
var indicators = requireRoot('/data/indicators');
var reset = requireRoot('/animations/reset');

module.exports = function resetAll(owner) {
  reset(owner, 'basketOff', baskets);
  owner.reboundOff();
  owner.hoopOff();

  for (var i = 0; i < baskets.length; i++) {
    owner.publish('box.raw.input', { msg: 'basketOff', data: i });
  }
  for (var i = 0; i < indicators.length; i++) {
    owner.publish('box.raw.input', { msg: 'indicatorOff', data: i });
  }
};

