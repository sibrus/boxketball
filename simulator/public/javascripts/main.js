var Simulator = function() {
  _.bindAll(this);
};

Simulator.prototype = {
  init: function() {
    this.hoopLight = false;
    this.reboundLight = false;

    this.baskets = [
      { 
        points: 1,
        light: false
      },
      { 
        points: 1,
        light: false
      },
      { 
        points: 1,
        light: false
      },
      { 
        points: 3,
        light: false
      },
      { 
        points: 5,
        light: false
      }
    ];

    this.buttons = [
      {
        label: 'Player 1',
        indicator: 0
      },
      {
        label: 'Player 2',
        indicator: 1
      },
      {
        label: 'Intercept',
        indicator: 2
      },
      {
        label: 'Rebound Yes',
        indicator: false
      },
      {
        label: 'Rebound No',
        indicator: false
      },
      {
        label: 'Up',
        indicator: false
      },
      {
        label: 'Down',
        indicator: false
      },
      {
        label: 'Left',
        indicator: false
      },
      {
        label: 'Right',
        indicator: false
      },
      {
        label: 'Select',
        indicator: false
      }
    ];

    this.switches = [
      {
        on: false,
        label: 'Demo Mode',
        indicator: 3
      }
    ];

    this.indicators = [
      {
        label: false,
        light: false
      },
      {
        label: false,
        light: false
      },
      {
        label: false,
        light: false
      },
      {
        label: false,
        light: false
      },
      {
        label: 'Accent Light 1',
        light: false
      },
      {
        label: 'Accent Light 2',
        light: false
      }
    ];

    var templateStr = $('#template').html();
    this.template = _.template(templateStr);

    this.$el = $('#main');

    this.initSocket();
  },

  getButtonClass: function(button) {
    if (button.indicator === false) {
      return 'btn-info';
    }
    return (this.indicators[button.indicator].light) ? 'btn-success' : 'btn-default';
  },

  getSwitchClasses: function(switchItem) {
    var baseClass;
    if (switchItem.indicator === false) {
      baseClass = 'btn-info';
    } else {
      baseClass = (this.indicators[switchItem.indicator].light) ? 'btn-success' : 'btn-default';
    }
    if (switchItem.on) {
      baseClass += ' active';
    }
    return baseClass;
  },

  initSocket: function() {
    this.socket = io();
    this.socket.on('handshake', function(message) {
      console.log('Got handshake: ' + message);
    });

    this.socket.on('box.raw.input', this.processMessage);
  },

  processMessage: function(payload) {
    console.log('Got message: ');
    console.log(payload);
    if (payload.msg == 'basketOn') {
      this.baskets[payload.data].light = true;
      $('#basket_' + payload.data).addClass('btn-success').removeClass('btn-default');
    } else if (payload.msg == 'basketOff') {
      this.baskets[payload.data].light = false;
      $('#basket_' + payload.data).addClass('btn-default').removeClass('btn-success');
    } else if (payload.msg == 'hoopOn') {
      $('#hoop').addClass('btn-success').removeClass('btn-default');
      this.hoopLight = true;
    } else if (payload.msg == 'hoopOff') {
      $('#hoop').addClass('btn-default').removeClass('btn-success');
      this.hoopLight = false;
    } else if (payload.msg == 'reboundOn') {
      $('#rebound').addClass('btn-success').removeClass('btn-default');
      this.reboundLight = true;
    } else if (payload.msg == 'reboundOff') {
      $('#rebound').addClass('btn-default').removeClass('btn-success');
      this.reboundLight = false;
    }
  },

  handleClick: function(e) {
    var $target = $(e.delegateTarget);
    var targetType = $target.attr('data-type');
    var targetId = parseInt($target.attr('data-id'));

    if (targetType == 'basket') {
      console.log('Hit basket: ' + targetId);
      this.socket.emit('box.raw.output', { msg: "basketHit", data: targetId });
    } else if (targetType == 'button') {
      this.socket.emit('box.raw.output', { msg: "buttonPress", data: targetId });
    } else if (targetType == 'switch') {
      var switchItem = this.switches[targetId];
      switchItem.on = !switchItem.on;
      if (switchItem.on) {
        this.socket.emit('box.raw.output', { msg: "switchOn", data: targetId });        
      } else {
        this.socket.emit('box.raw.output', { msg: "switchOff", data: targetId });                
      }
      this.render();
    } else if (targetType == 'hoop') {
      this.socket.emit('box.raw.output', { msg: "hoopHit" });
    } else if (targetType == 'rebound') {
      this.socket.emit('box.raw.output', { msg: "reboundHit" });
    } else if (targetType == 'indicator') {
      console.log('Indicators do nothing when pressed.');
    } else {
      console.log('Clicked on unknown: ' + targetType + ' - ' + targetId);      
    }
  },

  render: function() {
    $('button').off();
    this.$el.html(this.template(this));
    $('button').on('click', this.handleClick);
  }
}

var simulator = new Simulator();

$(document).ready(function() {
  simulator.init();
  simulator.render();
});