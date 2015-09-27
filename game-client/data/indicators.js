var indicators = [
  {
    type: 'button',
    index: 0
  },
  {
    type: 'button',
    index: 1
  },
  {
    type: 'button',
    index: 2
  },
  {
    type: 'button',
    index: 3
  },
  {
    type: 'button',
    index: 4
  },
  {
    type: 'button',
    index: 5
  },
  {
    type: 'switch',
    index: 0
  },
  {
    type: 'button',
    index: 6
  },
  {
    type: 'button',
    index: 7
  },
  {
    type: 'generic',
    key: 'p1'
  },
  {
    type: 'generic',
    key: 'p2'
  }
];

for (var i = 0; i < indicators.length; i++) {
  indicators[i].number = i;
}

module.exports = indicators;