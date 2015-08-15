var BoxketballClient = function() {
  _.bindAll(this);
};

BoxketballClient.prototype = {
  init: function() {
    this.initSocket();
  },

  initSocket: function() {
    this.socket = io();
    this.socket.on('handshake', function(message) {
      console.log('Got handshake: ' + message);
    });

    this.socket.on('box.events', this.processMessage);
    this.socket.on('box.game.boxketball', this.processMessage);
  },

  processMessage: function(payload) {
    try {
      console.log('Got message: ');
      console.log(payload);
    } catch(e) {
      console.log('Error processing message: ' + e);
    }
  }
}

var boxketballClient = new BoxketballClient();

$(document).ready(function() {
  boxketballClient.init();
});
