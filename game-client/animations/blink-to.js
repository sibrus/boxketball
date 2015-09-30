var Promise = require('bluebird');
var co = require('co');

function changeState(state, owner, options) {
  if (options.target === 'hoop') {
    if (state) {
      owner.hoopOn();
    } else {
      owner.hoopOff();
    }
  }
  if (options.target === 'rebound') {
    if (state) {
      owner.reboundOn();
    } else {
      owner.reboundOff();
    }
  }
  if (typeof options.target === 'object') {
    if (typeof options.target.basket !== 'undefined') {
      if (state) {
        owner.basketOn(options.target.basket);
      } else {
        owner.basketOff(options.target.basket);
      }
    }
    if (typeof options.target.button !== 'undefined') {
      if (state) {
        owner.buttonOn(options.target.button);
      } else {
        owner.buttonOff(options.target.button);
      }
    }
    if (typeof options.target.indicator !== 'undefined') {
      if (state) {
        owner.indicatorOn(options.target.indicator);
      } else {
        owner.indicatorOff(options.target.indicator);
      }
    }
  }
}

module.exports = function blinkTo(owner, options) {
  options = _.extend({},
  {
    target: { basket: 1 },
    delay: 140,
    count: 5,
    ending: 'off'
  }, options);

  var aborted = false;
  return co(function *() {
    var nextState = (options.ending == 'off') ? true : false;
    for (var i = 0; i < options.count; i++) {
      changeState(nextState, owner, options);
      yield Promise.delay(options.delay);
      nextState = !nextState;
    }

    nextState = (options.ending == 'off') ? false : true;
    changeState(nextState, owner, options);
  })
  .cancellable()
  .catch(function(e) {
    aborted = true;
  });
};