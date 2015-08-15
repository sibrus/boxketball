var _ = require('lodash');
var redis = require('redis');
var Promise = require('bluebird');

Promise.promisifyAll(redis);

var Client = function(owner) {
	this.owner = owner;
	_.bindAll(this);
	this.init();
};

Client.prototype = {
  init: function() {
    this.subClient = redis.createClient();
    this.pubClient = redis.createClient();

    this.subClient.on('message', _.bind(function(channel, message) {
      try {
        var payload = JSON.parse(message);
        this.owner.processMessage(channel, payload);
      } catch (e) {
        console.log('Error: ' + e);
        console.log('From message: ' + message);
      }
    }, this));

    this.subClient.subscribe('box.raw.output');
  },

  publish: function(channel, payload) {
    this.pubClient.publish(channel, JSON.stringify(payload));
  }
};

module.exports = Client;