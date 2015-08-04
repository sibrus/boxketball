/**
 * A test boxketball client that briefly turns on basket lights
 * each time a basket is hit.
 */

var Promise = require('bluebird');

var redis = require('redis');
Promise.promisifyAll(redis);

var subClient = redis.createClient();
var pubClient = redis.createClient();

function publishMessage(message) {
  pubClient.publish('box.raw.input', JSON.stringify(message));
}

subClient.on('message', function(channel, message) {
  try {
    var payload = JSON.parse(message);
    if (payload.msg === 'basketHit') {
      publishMessage({ msg: 'basketOn', data: payload.data });
      setTimeout(function() {
        publishMessage({ msg: 'basketOff', data: payload.data });
      }, 100);
    } else if (payload.msg === 'hoopHit') {
      publishMessage({ msg: 'hoopOn' });
      setTimeout(function() {
        publishMessage({ msg: 'hoopOff' });
      }, 100);
    } else if (payload.msg === 'reboundHit') {
      publishMessage({ msg: 'reboundOn', data: payload.data });
      setTimeout(function() {
        publishMessage({ msg: 'reboundOff', data: payload.data });
      }, 100);
    } else if (payload.msg === 'buttonPress') {
      if (payload.data >= 0 && payload.data < 3) {
        publishMessage({ msg: 'indicatorOn', data: payload.data });
        setTimeout(function() {
          publishMessage({ msg: 'indicatorOff', data: payload.data });
        }, 100);
      }
      if (payload.data == 5) {
        publishMessage({ msg: 'indicatorOn', data: 4 });
        setTimeout(function() {
          publishMessage({ msg: 'indicatorOff', data: 4 });
        }, 100);
      }
      if (payload.data == 6) {
        publishMessage({ msg: 'indicatorOn', data: 5 });
        setTimeout(function() {
          publishMessage({ msg: 'indicatorOff', data: 5 });
        }, 100);
      }
    } else if (payload.msg === 'switchOn') {
        publishMessage({ msg: 'indicatorOn', data: 3 });
    } else if (payload.msg === 'switchOff') {
        publishMessage({ msg: 'indicatorOff', data: 3 });
    }

  } catch (e) {
    console.log('Error: ' + e);
    console.log('From message: ' + message);
  }
});

subClient.subscribe('box.raw.output');
