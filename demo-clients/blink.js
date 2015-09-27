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
      }, 250);
    } else if (payload.msg === 'hoopHit') {
      publishMessage({ msg: 'hoopOn' });
      setTimeout(function() {
        publishMessage({ msg: 'hoopOff' });
      }, 250);
    } else if (payload.msg === 'reboundHit') {
      publishMessage({ msg: 'reboundOn', data: payload.data });
      setTimeout(function() {
        publishMessage({ msg: 'reboundOff', data: payload.data });
      }, 250);
    } else if (payload.msg === 'buttonPress') {
      if (payload.data == 0) {
        publishMessage({ msg: 'indicatorOn', data: 9 });
        setTimeout(function() {
          publishMessage({ msg: 'indicatorOff', data: 9 });
        }, 250);
      }
      if (payload.data == 2) {
        publishMessage({ msg: 'indicatorOn', data: 10 });
        setTimeout(function() {
          publishMessage({ msg: 'indicatorOff', data: 10 });
        }, 250);
      }
      if (payload.data >= 0 && payload.data <= 5) {
        publishMessage({ msg: 'indicatorOn', data: payload.data });
        setTimeout(function() {
          publishMessage({ msg: 'indicatorOff', data: payload.data });
        }, 250);
      }
      if (payload.data >= 6 && payload.data <= 7) {
        publishMessage({ msg: 'indicatorOn', data: payload.data + 1 });
        setTimeout(function() {
          publishMessage({ msg: 'indicatorOff', data: payload.data + 1 });
        }, 250);
      }
    } else if (payload.msg === 'switchOn') {
        publishMessage({ msg: 'indicatorOn', data: 6 });
    } else if (payload.msg === 'switchOff') {
        publishMessage({ msg: 'indicatorOff', data: 6 });
    }

  } catch (e) {
    console.log('Error: ' + e);
    console.log('From message: ' + message);
  }
});

subClient.subscribe('box.raw.output');
