var SerialPort = require('serialport').SerialPort
var serialPort = new SerialPort('/dev/ttyUSB0', {
  baudrate: 57600
});

var Promise = require('bluebird');

var redis = require('redis');
Promise.promisifyAll(redis);

var pubClient = redis.createClient();
var subClient = redis.createClient();

var inputBuffer = new Buffer(2);
var outputBuffer = new Buffer(2);
var bufferPos = 0;

subClient.on('message', function(channel, message) {
  try {
    var payload = JSON.parse(message);
    switch (payload.msg) {
    case 'basketOn':
      writeToSerial('+', payload.data);
      break;
    case 'basketOff':
      writeToSerial('-', payload.data);
      break;
    case 'indicatorOn':
      writeToSerial('I', payload.data);
      break;
    case 'indicatorOff':
      writeToSerial('i', payload.data);
      break;
    default:
      console.log('Unknown message: ' + message);
    }
  } catch (e) {
    console.log('Error: ' + e);
    console.log('From message: ' + message);
  }
});

subClient.subscribe('box.raw.input');

function publishMessage(message) {
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  pubClient.publish('box.raw.output', message);
}

function writeToSerial(cmd, data) {
  outputBuffer[0] = cmd.charCodeAt(0);
  outputBuffer[1] = data;
  var msg = cmd + data;
  //console.log('Sending: ' + outputBuffer);
  serialPort.write(outputBuffer);
}

function processSerialBuffer() {    
  var cmd = String.fromCharCode(inputBuffer[0]);
  var data = inputBuffer[1];
  //console.log('cmd: ' + cmd);
  //console.log('cmdRaw: ' + inputBuffer[0]);
  //console.log('data: ' + data);
  if (cmd == 'B') {
    publishMessage({ msg: "basketHit", data: data });
    //writeToSerial('+', data);
    //setTimeout(function() { writeToSerial('-', data); }, 100);
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
        processSerialBuffer();
      }
    }
  });
});