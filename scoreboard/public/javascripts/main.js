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
    this.socket.on('box.game.scoreattack', this.processScoreAttack);
  },

  processEventMessage: function(payload) {
    try {
      var eventHtml = $('<li>').append($('<label>').text('Global event: ' + payload.event)).append($('<pre>').text(JSON.stringify(payload.data)));

      $('#events').prepend(eventHtml);

      console.log('Got event message: ');
      console.log(payload);
      
      /* SCORE ATTACK */
      if (payload.event == 'transition' && payload.data == 'scoreattack') {
        $('#idle-screen').hide();
        $('#classic-mode').hide();
        $('#score-attack').show();
      }
      else if (payload.event == 'transition' && payload.data == 'boxketball') {
        $('#idle-screen').hide();
        $('#classic-mode').show();
        $('#score-attack').hide();        
      }
      else if (payload.event == 'transition' && payload.data == 'idle') {
        $('#idle-screen').show();
        $('#classic-mode').hide();
        $('#score-attack').hide();        
      }
      
    } catch(e) {
      console.log('Error processing event message: ' + e);
    }
  },

  processScoreAttack: function(payload) {
    try {
      console.log(payload);
      var game = payload.gameState;
      $('#idle-screen').hide();
      $('#classic-mode').hide();
      $('#score-attack').show();
      $('#score-attack').removeClass('game-over');
      
      if (payload.event == 'preGameCountDown') {
        $('.countdown').show();
        $('#sa_countdown').text(payload.data.count);
      }
      else if (payload.event == 'gameOver') {
        setTimeout(function(){
          $('#score-attack').addClass('game-over');
        }, 1500);
      }
      else if (payload.event == 'multiplierHit') {
        $('#events-flasher').append('<div class="event" id="event-multiply"><div class="wrap"><i class="icon-bolt"></i><span class="event-text">POWER UP</span></div></div>');
        $('#event-multiply').addClass('active');
      }
      else if (payload.event == 'hitHoop') {
        $('#events-flasher').append('<div class="event" id="event-hoop"><div class="wrap"><i class="icon-question"></i><span class="event-text">HOOP DREAMS</span></div></div>');
        $('#event-hoop').addClass('active');
      }
      else {
        $('.countdown').hide();

        $('#sa_points').text(game.players[0].score);
  
        var time_left = Number(game.players[0].timeLeft);
        if (time_left <= 10) {
          $('#sa_timeleft').addClass('expiring');
          if (time_left <= 5 && time_left != 0) {
            $('#sa_timeleft').addClass('expiring-faster');
          }
          else if (time_left == 0) {
            $('#sa_timeleft').removeClass('expiring').removeClass('expiring-faster').addClass('expired');
          }
        } else {
          $('#sa_timeleft').removeClass('expiring');
        }
        var m = Math.floor(time_left / 60);
        var s = Math.floor(time_left % 60);
        var timer_text = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
        $('#sa_timeleft').text(timer_text);
      }
    } catch(e) {
      console.log('Error processing game message: ' + e);
    }
  },

  processGameMessage: function(payload) {
    try {
      console.log(payload);
      var game = payload.gameState;

      $('.splash').hide();
      $('#classic-mode').removeClass('game-over');

      if (payload.event == 'gameStarting') {
        $('.splash').show();
      }
      else if (payload.event == 'gameOver') {
        var p1_final_score = game.players[0].score;
        var p2_final_score = game.players[1].score;
        if (p1_final_score > p2_final_score) {
          $('#game_winner').text('P1');
        } else {
          $('#game_winner').text('P2');          
        }
        $('#classic-mode').addClass('game-over');
      }
      else {
        if (payload.event == 'steal' || payload.event == 'miss' || payload.event == 'multiplierHit' || payload.event == 'hitHoop' || payload.event == 'startSuddenDeath' || payload.event == 'hitBasket') {
          $('.event').remove();        
        }
        if (payload.event == 'steal') {
          $('#events-flasher').append('<div class="event" id="event-steal"><div class="wrap"><i class="icon-emoji-happy"></i><span class="event-text">STEAL!</span></div></div>');
          $('#event-steal').addClass('active');
        }
        else if (payload.event == 'miss') {
          $('#events-flasher').append('<div class="event" id="event-miss"><div class="wrap"><i class="icon-emoji-sad"></i><span class="event-text">MISS</span></div></div>');
          $('#event-miss').addClass('active');
        }
        else if (payload.event == 'multiplierHit') {
          $('#events-flasher').append('<div class="event" id="event-multiply"><div class="wrap"><i class="icon-bolt"></i><span class="event-text">POWER UP</span></div></div>');
          $('#event-multiply').addClass('active');
        }
        else if (payload.event == 'hitHoop') {
          $('#events-flasher').append('<div class="event" id="event-hoop"><div class="wrap"><i class="icon-question"></i><span class="event-text">HOOP DREAMS</span></div></div>');
          $('#event-hoop').addClass('active');
        }
        else if (payload.event == 'startSuddenDeath') {
          $('#events-flasher').append('<div class="event" id="event-overtime"><div class="wrap"><i class="icon-skull"></i><span class="event-text">SUDDEN DEATH</span></div></div>');
          $('#event-overtime').addClass('active');
        }
        else if (payload.event == 'hitBasket' && payload.data.basket.points >= 15) {
          $('#events-flasher').append('<div class="event" id="event-holyshit"><div class="wrap"><i class="icon-emoji-shock"></i><span class="event-text">HOLY SHIT</span></div></div>');
          $('#event-holyshit').addClass('active');              
        }
        
        $('#idle-screen').hide();
        $('#classic-mode').show();
        $('#score-attack').hide();        
        
        $('#state').text(game.gameState);
        $('#turn').text(game.playerTurn);
        $('#posession').text(game.playerPosession);
        $('#multiplier').text(game.multiplierHit ? 'YES' : 'no');
        
        $('#classic-mode').removeClass('pos-1 pos-2');
        $('#classic-mode').addClass('pos-'+game.playerPosession);
        
        var cur_p1_balls = $('#p1_balls').filter('i').length;
        var cur_p2_balls = $('#p2_balls').filter('i').length;
        var cur_p1_score = $('#p1_score').html();
        var cur_p2_score = $('#p2_score').html();      
  
        p1_balls_text = '';      
        for (var i = 0, len = game.players[0].ballsLeft; i < len; i++) {
          p1_balls_text += '<i class="icon-ball"></i>';
        }      
  
        p2_balls_text = '';      
        for (var i = 0, len = game.players[1].ballsLeft; i < len; i++) {
          p2_balls_text += '<i class="icon-ball"></i>';
        }      
  
        var new_p1_score = game.players[0].score;
        var new_p2_score = game.players[1].score;
        
        $('#p1_score').text(game.players[0].score);
        $('#p2_score').text(game.players[1].score);
        $('#p1_balls').html(p1_balls_text);
        $('#p2_balls').html(p2_balls_text);

      }
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
