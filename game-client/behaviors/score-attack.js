var Promise = require('bluebird');
var co = require('co');

var requireRoot = require('app-root-path').require;

var Behavior = require('./behavior');
var baskets = requireRoot('/data/baskets');
var buttons = requireRoot('/data/buttons');
var indicators = requireRoot('/data/indicators');
var switches = requireRoot('/data/switches');
var reset = requireRoot('/animations/reset');
var resetAll = requireRoot('/animations/reset-all');
var pickPlayer = requireRoot('/animations/pick-player');

var Player = function(num) {
  this.number = num;
  this.score = 0;
  this.timeLeft = 60;
};

Player.prototype.toJSON = function() {
  return {
    number: this.number,
    score: this.score,
    timeLeft: this.timeLeft
  };
}

var BoxketballGame = Behavior.extend({
  initHook: function() {
    resetAll(this);
    this.gameState = 'starting';
    this.players = [
      new Player(1)
    ];
    this.multiplierHit = false;

    this.publishGame('gameStarting');
    var self = this;
    co(function *() {
      for (var i = 0; i < 5; i++) {
        self.publishGame('preGameCountDown', { count: 5 - i });
        yield Promise.delay(1000);
      }
      self.startGame();
    });
  },
  startGame: function() {
    this.gameState = 'gameOn';
    this.publishGame('gameOn');
    var self = this;
    co(function *() {
      for (var i = 0; i < 60; i++) {
        yield Promise.delay(1000);
        self.players[0].timeLeft -= 1;
        self.publishGame('clockTick');
      }
      self.endGame();
    });
  },
  getCurrentPlayer: function() {
    return this.players[0];
  },
  endGame: function() {
    this.gameState = 'gameOver';
    this.publishGame('gameOver', { score: this.players[0].score });

    var self = this;
    co(function *() {
      yield Promise.delay(5000);
      self.transitionTo('idle');
    });
  },
  getGameState: function() {
    var gameState = {
      gameState: this.gameState
    };
    if (this.gameState != 'starting') {
      gameState.multiplierHit = this.multiplierHit;
      gameState.players = _.map(this.players, function(x) { return x.toJSON(); });
    }
    return gameState;
  },
  publishGame: function(eventName, data) {
    this.publish('box.game.scoreattack',
    {
      event: eventName,
      data: data,
      gameState: this.getGameState()
    })
  },
  processMessage: function(channel, payload) {
    console.log('BoxketballGame got message');
    if (channel == 'box.raw.output') {
      if (payload.msg === 'basketHit') {
        this.tryHitBasket(payload.basket);
      }
      if (payload.msg === 'reboundHit') {
        this.hitRebound();
      }
      if (payload.msg === 'hoopHit') {
        this.hitHoop();
      }
      if (payload.msg === 'buttonPress') {
        if (payload.button.key === 'rebound_yes') {
          this.hitRebound();
        } else if (payload.button.key === 'rebound_no') {
          this.clearRebound();
        }
      }
    }
  },
  clearRebound: function() {
    this.multiplierHit = false;
    this.publishGame('multiplierCleared');
  },
  hitRebound: function() {
    this.multiplierHit = true;
    this.publishGame('multiplierHit');
    var self = this;
    co(function *() {
      yield Promise.delay(5000);
      if (self.multiplierHit) {
        self.multiplierHit = false;
        self.publishGame('multiplierCleared');
      }
    });
  },
  hitHoop: function() {
    var player = this.getCurrentPlayer();
    player.score += 2;
    this.publishGame('hitHoop');
  },
  tryHitBasket: function(basket) {
    if (this.gameState != 'gameOn') {
      console.log('Cannot hit basket unless the game is on... ' + this.gameState);
      return;
    }

    var player = this.getCurrentPlayer();

    var multiple = (this.multiplierHit) ? 2 : 1;
    player.score += basket.points * multiple;
    this.publishGame('hitBasket', { basket: basket });
  }
});

module.exports = BoxketballGame;