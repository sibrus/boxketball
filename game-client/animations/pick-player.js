var Promise = require('bluebird');
var co = require('co');

var reset = require('./reset');

function playerOn(owner, player) {
  if (player == 1) {
    owner.indicatorOn('p1');
    owner.buttonOn('p1_miss');
    owner.buttonOn('p1_steal');
  } else {
    owner.indicatorOn('p2');
    owner.buttonOn('p2_miss');
    owner.buttonOn('p2_steal');    
  }
}

function playerOff(owner, player) {
  if (player == 1) {
    owner.indicatorOff('p1');
    owner.buttonOff('p1_miss');
    owner.buttonOff('p1_steal');
  } else {
    owner.indicatorOff('p2');
    owner.buttonOff('p2_miss');
    owner.buttonOff('p2_steal');    
  }
}

function delayFn(iteration) {
  if (iteration < 5) {
    return 150;
  }
  if (iteration < 12) {
    return 200;
  }
  if (iteration < 17) {
    return 300;
  }
  if (iteration < 20) {
    return 400;
  }
  var map = {
    20: 500,
    21: 600,
    22: 700,
    23: 800,
    24: 900,
    25: 1000
  };
  return map[iteration];
}

module.exports = function pickPlayer(owner, selectedPlayer) {
  var aborted = false;
  return co(function *() {
    var thisPlayer = (rand.bool()) ? 1 : 2;
    var numTicks = (thisPlayer == selectedPlayer) ? 25 : 26;

    playerOff(owner, 1);
    playerOff(owner, 2);

    for (var i = 0; i < numTicks; i++) {
      playerOff(owner, (thisPlayer == 1) ? 2 : 1);
      playerOn(owner, thisPlayer);
      thisPlayer = (thisPlayer == 1) ? 2 : 1;

      yield Promise.delay(delayFn(i)).cancellable();
    }

    playerOff(owner, selectedPlayer);
    yield Promise.delay(333).cancellable();
    playerOn(owner, selectedPlayer);
    yield Promise.delay(333).cancellable();
    playerOff(owner, selectedPlayer);
    yield Promise.delay(333).cancellable();
    playerOn(owner, selectedPlayer);
    yield Promise.delay(333).cancellable();
    playerOff(owner, selectedPlayer);
    yield Promise.delay(333).cancellable();
    playerOn(owner, selectedPlayer);
    yield Promise.delay(500).cancellable();
  })
  .cancellable()
  .catch(function(e) {
    aborted = true;
  });
};