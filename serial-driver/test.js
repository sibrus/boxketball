var SerialPort = require('serialport').SerialPort
var serialPort = new SerialPort('/dev/ttyUSB0', {
  baudrate: 57600
});

var inputBuffer = new Buffer(2);
var outputBuffer = new Buffer(2);
var bufferPos = 0;

function sendMessage(cmd, data) {
  outputBuffer[0] = cmd.charCodeAt(0);
  outputBuffer[1] = data;
  var msg = cmd + data;
  //console.log('Sending: ' + outputBuffer);
  serialPort.write(outputBuffer);
}

function processBuffer() {    
  var cmd = String.fromCharCode(inputBuffer[0]);
  var data = inputBuffer[1];
  //console.log('cmd: ' + cmd);
  //console.log('cmdRaw: ' + inputBuffer[0]);
  //console.log('data: ' + data);
  if (cmd == 'B') {
    sendMessage('+', data);
    setTimeout(function() { sendMessage('-', data); }, 100);
  } else {
    console.log('cmd: ' + cmd);
    console.log('cmdRaw: ' + inputBuffer[0]);
  }
  bufferPos = 0;
}

serialPort.on('open', function () {
  console.log('open');
  serialPort.on('data', function(data) {
    for (var i = 0; i < data.length; i++) {
      inputBuffer[bufferPos] = data[i];
      bufferPos++;
      if (bufferPos >= 2) {
        processBuffer();
      }
    }
  });
});