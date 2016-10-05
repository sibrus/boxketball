var Promise = require('bluebird');
var co = require('co');

var reset = require('./reset');

module.exports = function cycleBaskets(owner, baskets, cycleTime, loop) {
  var aborted = false;
  return co(function *() {
    reset(owner, 'basketOff', baskets);
    var first = true;
    while (!aborted && (first || loop)) {
      first = false;
      for (var i = 0; i < baskets.length; i++) {
        if (aborted) {
          break;
        }
        if (i - 1 >= 0) {
          owner.basketOff(baskets[i-1]);
        } else {
          owner.basketOff(baskets[baskets.length-1]);
        }
        owner.basketOn(baskets[i]);

        yield Promise.delay(cycleTime).cancellable();
      }
    }
  })
  .cancellable()
  .catch(function(e) {
    aborted = true;
  });
};