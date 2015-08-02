var SocketIO = require('socket.io');
var _ = require('lodash');
var Promise = require('bluebird');
var uuid = require('node-uuid');
var redis = require('redis');
Promise.promisifyAll(redis);

var SocketServer = function(server) {
  _.bindAll(this);

  this.initialize(server);
};

SocketServer.prototype = {
  initialize: function(server) {
    this.pubClient = redis.createClient();
    this.subClient = redis.createClient();
    this.subClient.on('message', this.processInMsg);
    this.subClient.subscribe('box.raw.input');

    this.io = SocketIO(server);

    this.io.on('connection', _.bind(function(socket) {
      console.log('a user connected: ' + socket.id);
      
      socket.on('disconnect', function() {
        console.log('user disconnected: ' + socket.id);
      });

      socket.on('box.raw.output', this.processOutMsg);

      socket.emit('handshake', 'hello');
               
    }, this));
  },

  processOutMsg: function(payload) {
    console.log('Got output msg:');
    console.log(payload);

    this.pubClient.publish('box.raw.output', JSON.stringify(payload));
  },

  processInMsg: function(channel, message) {
    try {
      var payload = JSON.parse(message);

      console.log('Publishing on: ' + channel);
      console.log(message);

      this.io.emit(channel, payload);
    } catch (e) {
      console.log('Error: ' + e);
      console.log('From message: ' + message);
    }
  }
};

module.exports = SocketServer;