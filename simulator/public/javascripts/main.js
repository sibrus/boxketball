var baskets = [
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
    light: true
  },
  { 
    points: 5,
    light: false
  }
];

var boxketball = {
  baskets: baskets
};

var template = null;

$(document).ready(function() {
  var templateStr = $('#template').html();
  template = _.template(templateStr);

  $('#main').html(template(boxketball));
});