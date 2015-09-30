/*
 BoxketBall 3.0
 Arduino controll code
 Author: Ivan Matyunin
 */

//#include <EnableInterrupt.h>
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

int numBaskets = 13;
int baskets[13];
int basketSensors[13];
volatile int sensorStates[13];
int lastSensorStates[13];
int triggeredBaskets[13];

int numIndicators = 11;
int indicators[11];

int numButtons = 8;
int buttons[8];
volatile int buttonStates[8];
int lastButtonStates[8];
int triggeredButtons[8];

int numSwitches = 1;
int switches[1];
volatile int switchStates[1];
int lastSwitchStates[1];
int changedSwitches[1];

int hoopLight;
int hoopSensor;
volatile int hoopState;
int lastHoopState;
int triggeredHoop;

byte inputBuffer[2];
int inputPos;

int numPiezoSensors = 5;
int piezoSensors[5];
int lastPiezoStates[5];
int triggeredPiezoSensors[5];
int piezoThreshold = 15;

#define basketInterrupt(x) void basketInterrupt ##x () { sensorStates[x] = digitalRead(basketSensors[x]); }

basketInterrupt(0);
basketInterrupt(1);
basketInterrupt(2);

void setup() {
  baskets[0] = 9;
  basketSensors[0] = 22;
  baskets[1] = 8;
  basketSensors[1] = 23;
  baskets[2] = 7;
  basketSensors[2] = 24;
  baskets[3] = 6;
  basketSensors[3] = 25;
  baskets[4] = 5;
  basketSensors[4] = 26;
  baskets[5] = 4;
  basketSensors[5] = 27;
  baskets[6] = 3;
  basketSensors[6] = 28;
  baskets[7] = 2;
  basketSensors[7] = 29;
  baskets[8] = 34;
  basketSensors[8] = 30;
  baskets[9] = 36;
  basketSensors[9] = 31;
  baskets[10] = 38;
  basketSensors[10] = 33;
  baskets[11] = 40;
  basketSensors[11] = 32;
  baskets[12] = 42;
  basketSensors[12] = 35;

  hoopLight = 44;
  hoopSensor = 37;

  buttons[0] = 39;
  buttons[1] = 41;
  buttons[2] = 43;
  buttons[3] = 45;
  buttons[4] = 47;
  buttons[5] = 49;
  buttons[6] = 52;
  buttons[7] = 53;

  indicators[0] = 11;
  indicators[1] = 10;
  indicators[2] = A5;
  indicators[3] = A6;
  indicators[4] = A7;
  indicators[5] = A8;
  indicators[6] = A9;
  indicators[7] = A10;
  indicators[8] = A11;
  indicators[9] = 46;
  indicators[10] = 48;

  switches[0] = 51;

  piezoSensors[0] = A0;
  piezoSensors[1] = A1;
  piezoSensors[2] = A2;
  piezoSensors[3] = A3;
  piezoSensors[4] = A4;

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

  attachInterrupt(basketSensors[0], basketInterrupt0, CHANGE);
  attachInterrupt(basketSensors[1], basketInterrupt1, CHANGE);
  attachInterrupt(basketSensors[2], basketInterrupt2, CHANGE);
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


