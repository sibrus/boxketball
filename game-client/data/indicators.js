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
    type: 'switch',
    index: 0
  },
  {
    type: 'generic',
    key: 'accent1'
  },
  {
    type: 'generic',
    key: 'accent2'
  }
];

for (var i = 0; i < indicators.length; i++) {
  indicators[i].number = i;
}

module.exports = indicators;