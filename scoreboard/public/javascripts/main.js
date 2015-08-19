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

    this.socket.on('box.events', this.processEventMessage);
    this.socket.on('box.game.boxketball', this.processGameMessage);
  },

  processEventMessage: function(payload) {
    try {
      var eventHtml = $('<li>').append($('<label>').text('Global event: ' + payload.event)).append($('<pre>').text(JSON.stringify(payload.data)));

      $('#events').prepend(eventHtml);

      console.log('Got event message: ');
      console.log(payload);
    } catch(e) {
      console.log('Error processing event message: ' + e);
    }
  },

  processGameMessage: function(payload) {
    try {
      var game = payload.gameState;
      $('#state').text(game.gameState);
      $('#turn').text(game.playerTurn);
      $('#posession').text(game.playerPosession);
      $('#multiplier').text(game.multiplierHit ? 'YES' : 'no');
      $('#p1_score').text(game.players[0].score);
      $('#p1_balls').text(game.players[0].ballsLeft);
      $('#p2_score').text(game.players[1].score);
      $('#p2_balls').text(game.players[1].ballsLeft);
    } catch(e) {
      console.log('Error processing game message: ' + e);
    }

    var eventHtml = $('<li>').append($('<label>').text('Boxketball event: ' + payload.event)).append($('<pre>').text(JSON.stringify(payload.data)));

    $('#events').prepend(eventHtml);
  }
}

var boxketballClient = new BoxketballClient();

$(document).ready(function() {
  boxketballClient.init();
});
