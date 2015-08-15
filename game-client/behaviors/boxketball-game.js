var _ = require('lodash');
var Behavior = require('./behavior');

var BoxketballGame = Behavior.extend({
  processMessage: function(channel, payload) {
    console.log('BoxketballGame got message');
  }
});

module.exports = BoxketballGame;