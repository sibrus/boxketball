var requireRoot = require('app-root-path').require;

var Behavior = require('./behavior');
var baskets = requireRoot('/data/baskets');
var buttons = requireRoot('/data/buttons');
var indicators = requireRoot('/data/indicators');
var switches = requireRoot('/data/switches');
var resetAll = requireRoot('/animations/reset-all');

var Player = function(num) {
  this.number = num;
  this.score = 0;
  this.ballsLeft = 5;
};

Player.prototype.toJSON = function() {
  return {
    number: this.number,
    score: this.score,
    ballsLeft: this.ballsLeft
  };
}

var BoxketballGame = Behavior.extend({
  initHook: function() {
    resetAll(this);
    this.gameState = 'started';
    this.players = [
      new Player(1),
      new Player(2)
    ];
    this.hitBaskets = [];
    this.giveTurn(1, false);
    this.multiplierHit = false;
    this.publishGame('gameStart');
  },
  getCurrentPlayer: function() {
    return this.players[this.playerTurn - 1];
  },
  nextTurn: function() {
    if (this.playerTurn == 1) {
      this.giveTurn(2);
    } else {
      this.giveTurn(1);
    }
  },
  giveTurn: function(playerNumber, emit) {
    this.givePosession(playerNumber, false);
    this.playerTurn = playerNumber;
    if (emit !== false) {
      this.publishGame('changeTurn', { player: playerNumber });
    }
  },
  givePosession: function(playerNumber) {
    this.playerPosession = playerNumber;
    for (var i = 0; i < baskets.length; i++) {
      if (this.isBasketHit(baskets[i])) {
        this.basketOff(baskets[i]);
      } else {
        this.basketOn(baskets[i]);
      }
    }
    if (playerNumber == 1) {
      this.buttonOn('p1_miss');
      this.buttonOn('p2_steal');
      this.buttonOff('p1_steal');
      this.buttonOff('p2_miss');
    } else {
      this.buttonOn('p1_steal');
      this.buttonOn('p2_miss');
      this.buttonOff('p1_miss');
      this.buttonOff('p2_steal');
    }
  },
  getGameState: function() {
    var gameState = {
      gameState: this.gameState
    };
    if (this.gameState == 'started') {
      gameState.playerTurn = this.playerTurn;
      gameState.playerPosession = this.playerPosession;
      gameState.multiplierHit = this.multiplierHit;
      gameState.players = _.map(this.players, function(x) { return x.toJSON(); });
    }
    return gameState;
  },
  publishGame: function(eventName, data) {
    this.publish('box.game.boxketball',
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
      if (payload.msg === 'buttonPress') {
        if (payload.button.key === 'rebound_yes') {
          this.hitRebound();
        } else if (payload.button.key === 'rebound_no') {
          this.reboundOff();
        } else if (payload.button.key === 'p1_miss') {
          this.tryMiss(1);
        } else if (payload.button.key === 'p1_steal') {
          this.trySteal(1);
        } else if (payload.button.key === 'p2_miss') {
          this.tryMiss(2);          
        } else if (payload.button.key === 'p2_steal') {
          this.trySteal(2);
        }
      }
    }
  },
  tryMiss: function(playerNumber) {
    if (playerNumber == this.playerPosession) {
      this.publishGame('miss', { player: playerNumber });

      var player = this.getCurrentPlayer();
      player.ballsLeft -= 1;

      this.nextTurn();
    }
  },
  trySteal: function(playerNumber) {
    if (playerNumber != this.playerPosession) {
      this.givePosession(playerNumber);
      this.publishGame('steal', { player: playerNumber });
    }
  },
  reboundOff: function() {
    this.multiplierHit = false
    this.publishGame('multiplerOff')
  },
  hitRebound: function() {
    this.multiplierHit = true;
    this.publishGame('multiplierHit');
  },
  isBasketHit: function(basket) {
    var playerNum = this.playerPosession;
    var hitBasket = _.find(this.hitBaskets, function(x) {
      return (x.basketNumber == basket.number && x.playerNumber == playerNum);
    });
    return (hitBasket != null);
  },
  tryHitBasket: function(basket) {
    var player = this.getCurrentPlayer();

    if (this.isBasketHit(basket)) {
      this.publishGame('hitDeadBasket', basket);
    } else {
      var multiple = (this.multiplierHit) ? 2 : 1;
      player.score += basket.points * multiple;
      this.hitBaskets.push({
        basketNumber: basket.number,
        playerNumber: this.playerPosession
      });
      this.publishGame('hitBasket', basket);
    }

    player.ballsLeft -= 1;

    this.nextTurn();
  }
});

module.exports = BoxketballGame;