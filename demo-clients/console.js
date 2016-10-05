/**
 * A very simple boxketball client - simply subscribes to all messages
 * and then outputs them via console.log
 */

var Promise = require('bluebird');

var redis = require('redis');
Promise.promisifyAll(redis);

var client = redis.createClient();

client.on('message', function(channel, message) {
  console.log('Message on: ' + channel + ' = ' + message);
});

client.subscribe('box.raw.output');
client.subscribe('box.raw.input');
client.subscribe('box.events');
client.subscribe('box.game.boxketball');
client.subscribe('box.game.scoreattack');
