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
var blinkTo = requireRoot('/animations/blink-to');
var cycleBaskets = requireRoot('/animations/cycle-baskets');

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

    this.buttonOn('rebound_yes');
    this.buttonOn('rebound_no');
    this.buttonOn('soft_reset');
    this.buttonOn('hard_reset');
    this.switchOn(0);
    this.reboundOff();

    this.gameState = 'starting';
    this.players = [
      new Player(1),
      new Player(2)
    ];
    this.hitBaskets = [];
    this.multiplierHit = false;
    this.hoopHit = false;
    this.inSuddenDeath = false;
    this.numSuddenDeath = 0;

    this.cycler1 = null;

    this.publishGame('gameStarting');
    this.decidePlayerTurn();
  },
  decidePlayerTurn: function() {
    var startingPlayer = (rand.bool()) ? 1 : 2;
    this.cycler1 = cycleBaskets(this, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ,11, 12], 150, true);
    pickPlayer(this, startingPlayer)
      .bind(this)
      .then(function() {
        this.cycler1.cancel('intro over');
        this.cycler1 = null;
        this.giveTurn(startingPlayer, false);
        this.gameState = 'gameOn';
        this.publishGame('gameOn');
      });
  },
  getCurrentPlayer: function() {
    return this.players[this.playerTurn - 1];
  },
  nextTurn: function(delayTime) {
    delayTime = delayTime || 1000;
    
    this.gameState = 'turnTransition';
    var nextPlayerTurn = (this.playerTurn == 1) ? 2 : 1;
    this.publishGame('changingTurn', { nextPlayerTurn: nextPlayerTurn });

    this.indicatorOff('p1');
    this.indicatorOff('p2');
    this.buttonOff('p1_miss');
    this.buttonOff('p1_steal');
    this.buttonOff('p2_steal');        
    this.buttonOff('p2_miss');

    return Promise.delay(delayTime)
      .bind(this)
      .then(function() {
        this.giveTurn(nextPlayerTurn);
      });
  },
  playersOutOfBalls: function() {
    return (this.players[0].ballsLeft == 0 && this.players[1].ballsLeft == 0);
  },
  haveWinner: function() {
    return (this.players[0].score != this.players[1].score);
  },
  startSuddenDeath: function() {
    this.inSuddenDeath = true;
    this.numSuddenDeath += 1;
    this.gameState = 'suddenDeath';
    this.players[0].ballsLeft = 1;
    this.players[1].ballsLeft = 1;
    this.publishGame('startSuddenDeath', { numSuddenDeath: this.numSuddenDeath });
  },
  endGame: function() {
    var winner = (this.players[0].score > this.players[1].score) ? 1 : 2;
    this.gameState = 'gameOver';
    this.publishGame('gameOver', { winner: winner });

    var self = this;
    co(function *() {
      yield Promise.delay(5000);
      self.transitionTo('idle');
    });
  },
  giveTurn: function(playerNumber, emit) {
    if (this.playersOutOfBalls()) {
      if (this.haveWinner()) {
        this.endGame();
        return;
      } else {
        this.startSuddenDeath();
      }
    } else {
      this.gameState = (this.inSuddenDeath) ? 'suddenDeath' : 'gameOn';
    }

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
    this.multiplierHit = false;
    this.reboundOff();
    this.hoopOn();
    this.hoopHit = false;
    if (playerNumber == 1) {
      this.indicatorOn('p1');
      this.indicatorOff('p2');
      this.buttonOn('p1_miss');
      if (this.inSuddenDeath) {
        this.buttonOff('p2_steal');        
      } else {     
        this.buttonOn('p2_steal');
      }
      this.buttonOff('p1_steal');
      this.buttonOff('p2_miss');
    } else {
      this.indicatorOn('p2');
      this.indicatorOff('p1');
      this.buttonOn('p2_miss');
      if (this.inSuddenDeath) {        
        this.buttonOff('p1_steal');
      } else {
        this.buttonOn('p1_steal');
      }
      this.buttonOff('p1_miss');
      this.buttonOff('p2_steal');
    }
  },
  getGameState: function() {
    var gameState = {
      gameState: this.gameState
    };
    if (this.gameState != 'starting') {
      gameState.playerTurn = this.playerTurn;
      gameState.playerPosession = this.playerPosession;
      gameState.multiplierHit = this.multiplierHit;
      gameState.hoopHit = this.hoopHit;
      gameState.inSuddenDeath = this.inSuddenDeath;
      gameState.numSuddenDeath = this.numSuddenDeath;
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
      if (payload.msg === 'hoopHit') {
        this.hitHoop();
      }
      if (payload.msg === 'buttonPress') {
        if (payload.button.key === 'rebound_yes') {
          this.hitRebound();
        } else if (payload.button.key === 'rebound_no') {
          this.clearRebound();
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
    if (this.gameState != 'gameOn' && this.gameState != 'suddenDeath') {
      console.log('Cannot miss unless the game is on... ' + this.gameState);
      return;
    }

    if (playerNumber == this.playerPosession) {
      this.publishGame('miss', { player: playerNumber });

      var player = this.getCurrentPlayer();
      player.ballsLeft -= 1;

      this.nextTurn();
    }
  },
  trySteal: function(playerNumber) {
    if (this.gameState != 'gameOn') {
      console.log('Cannot steal unless the game is on... ' + this.gameState);
      return;
    }

    if (playerNumber != this.playerPosession) {
      this.givePosession(playerNumber);
      this.publishGame('steal', { player: playerNumber });
    }
  },
  clearRebound: function() {
    this.multiplierHit = false;
    this.reboundOff();
    this.publishGame('multiplierCleared');
  },
  hitRebound: function() {
    this.multiplierHit = true;
    this.publishGame('multiplierHit');
    blinkTo(this, { target: 'rebound', ending: 'on' });
  },
  hitHoop: function() {
    if (this.hoopHit) {
      return;
    }
    this.hoopHit = true;
    var player = this.getCurrentPlayer();
    player.score += 2;
    blinkTo(this, { target: 'hoop', ending: 'on' });
    this.publishGame('hitHoop');
  },
  isBasketHit: function(basket) {
    if (this.gameState == 'suddenDeath') {
      return false;
    }
    var playerNum = this.playerPosession;
    var hitBasket = _.find(this.hitBaskets, function(x) {
      return (x.basketNumber == basket.number && x.playerNumber == playerNum);
    });
    return (hitBasket != null);
  },
  tryHitBasket: function(basket) {
    if (this.gameState != 'gameOn' && this.gameState != 'suddenDeath') {
      console.log('Cannot hit basket unless the game is on (or sudden death)... ' + this.gameState);
      return;
    }

    var player = this.getCurrentPlayer();

    if (this.isBasketHit(basket)) {
      this.publishGame('hitDeadBasket', { basket: basket });
    } else {
      var multiple = (this.multiplierHit) ? 2 : 1;
      player.score += basket.points * multiple;
      this.hitBaskets.push({
        basketNumber: basket.number,
        playerNumber: this.playerPosession
      });
      this.publishGame('hitBasket', { basket: basket });
    }

    player.ballsLeft -= 1;

    var self = this;
    Promise.all([
      this.nextTurn(),
      co(function *() {
        //TODO:: Do some animation or something
        self.reboundOff();
        reset(self, 'basketOff', baskets);
        blinkTo(self, { target: { basket: basket.number }, delay: 140, count: 5, ending: 'off' });
      })
    ]);  
  }
});

module.exports = BoxketballGame;