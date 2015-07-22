/*
 BoxketBall 3.0
 Arduino controll code
 Author: Ivan Matyunin
 */

#include <EnableInterrupt.h>
#include <stdarg.h>

void serialf(char *fmt, ...) {
  char buf[128]; // resulting string limited to 128 chars
  va_list args;
  va_start(args, fmt);
  vsnprintf(buf, 128, fmt, args);
  va_end(args);
  Serial.print(buf);
}

void serialmsg(char a, byte b) {
  byte out[2];
  out[0] = (byte)a;
  out[1] = b;
  Serial.write(out, 2);
}

int numBaskets = 3;
int baskets[3];
int basketSensors[3];

volatile int sensorStates[3];
int lastSensorStates[3];

char triggeredBaskets[3];

int numIndicators = 2;
int indicators[2];

byte inputBuffer[2];
int inputPos;

#define basketInterrupt(x) void basketInterrupt ##x () { sensorStates[x] = digitalRead(basketSensors[x]); }

basketInterrupt(0);
basketInterrupt(1);
basketInterrupt(2);

void setup() {
  baskets[0] = 12;
  baskets[1] = 5;
  baskets[2] = 4;
  basketSensors[0] = 8;
  basketSensors[1] = 9;
  basketSensors[2] = 10;
  indicators[0] = 6;
  indicators[1] = 7;

  int i;
  for (i = 0; i < numBaskets; i++) {
    pinMode(baskets[i], OUTPUT); // init basket indicator pin as output
    pinMode(basketSensors[i], INPUT); // init sensor pin as input
    digitalWrite(basketSensors[i], HIGH); // turn on the pullup
    lastSensorStates[i] = HIGH;
    sensorStates[i] = HIGH;
    triggeredBaskets[i] = 0;
  }

  for (i = 0; i < numIndicators; i++) {
    pinMode(indicators[i], OUTPUT); // init misc indicator pin as output
  }

  Serial.begin(57600);

  enableInterrupt(basketSensors[0], basketInterrupt0, CHANGE);
  enableInterrupt(basketSensors[1], basketInterrupt1, CHANGE);
  enableInterrupt(basketSensors[2], basketInterrupt2, CHANGE);
}

void processInput() {
  char cmd = (char)inputBuffer[0];
  byte data = inputBuffer[1];

  switch(cmd) {
    case '+': //Turn on basket
      if (data >= 0 && data < numBaskets) {
        digitalWrite(baskets[data], HIGH);
      }
      break;
    case '-': //Turn off basket
      if (data >= 0 && data < numBaskets) {
        digitalWrite(baskets[data], LOW);
      }
      break;
    case 'I': //Turn on indicator
      if (data >= 0 && data < numIndicators) {
        digitalWrite(indicators[data], HIGH);
      }
      break;
    case 'i': //Turn off indicator
      if (data >= 0 && data < numIndicators) {
        digitalWrite(indicators[data], LOW);
      }
      break;
  }
  inputPos = 0;
}

void loop() {
  int i;

  for (i = 0; i < numBaskets; i++) {
    triggeredBaskets[i] = 0;
  }

  noInterrupts();
  for (i = 0; i < numBaskets; i++) {
    if (lastSensorStates[i] == HIGH && sensorStates[i] == LOW) {
      triggeredBaskets[i] = 1;
    }
    lastSensorStates[i] = sensorStates[i];
  }
  interrupts();

  for (i = 0; i < numBaskets; i++) {
    if (triggeredBaskets[i] == 1) {
      serialmsg('B', i);
    }
  }
  
  while (Serial.available() > 0) {
    byte nextByte = Serial.read();
    if (nextByte != -1) {
      inputBuffer[inputPos] = nextByte;
      inputPos++;

      if (inputPos >= 2) {
        processInput();
      } 
    } else {
      break;
    }
  }
}


