var buttons = [
  {
    key: 'p1_miss',
    indicator: 0
  },
  {
    key: 'p1_steal',
    indicator: 1
  },
  {
    key: 'p2_miss',
    indicator: 2
  },
  {
    key: 'p2_steal',
    indicator: 3
  },
  {
    key: 'rebound_yes',
    indicator: false
  },
  {
    key: 'rebound_no',
    indicator: false
  },
  {
    key: 'mode',
    indicator: false
  },
  {
    key: 'soft_reset',
    indicator: false
  },
  {
    key: 'hard_reset',
    indicator: false
  }
];

for (var i = 0; i < buttons.length; i++) {
  buttons[i].number = i;
}

module.exports = buttons;