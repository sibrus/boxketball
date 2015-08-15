module.exports = function reset(owner, messageType, targets) {
  for (var i = 0; i < targets.length; i++) {
    var target = targets[i];
    if (typeof(target) === 'object' && typeof(target.number) === 'number') {
      target = target.number;
    }
    owner.publish('box.raw.input', { msg: messageType, data: target });
  }
};

