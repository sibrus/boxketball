var Promise = require('bluebird');
var co = require('co');

function changeState(state, owner, options) {
  console.log('Change state to: ' + state);
  console.log(options);
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
    if (typeof options.basket !== 'undefined') {
      if (state) {
        owner.basketOn(options.basket);
      } else {
        owner.basketOff(options.basket);
      }
    }
    if (typeof options.button !== 'undefined') {
      if (state) {
        owner.buttonOn(options.button);
      } else {
        owner.buttonOff(options.button);
      }
    }
    if (typeof options.indicator !== 'undefined') {
      if (state) {
        owner.indicatorOn(options.indicator);
      } else {
        owner.indicatorOff(options.indicator);
      }
    }
  }
}

module.exports = function blinkTo(owner, options) {
  options = _.extend({},
  {
    target: { basket: 1 },
    delay: 250,
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