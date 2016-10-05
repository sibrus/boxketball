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

int reboundLight;

byte inputBuffer[2];
int inputPos;

int numPiezoSensors = 5;
int piezoSensors[5];
int lastPiezoStates[5];
int triggeredPiezoSensors[5];
int piezoThreshold = 20;

#define basketInterrupt(x) void basketInterrupt ##x () { sensorStates[x] = digitalRead(basketSensors[x]); }
#define buttonInterrupt(x) void buttonInterrupt ##x () { buttonStates[x] = digitalRead(buttons[x]); }
#define switchInterrupt(x) void switchInterrupt ##x () { switchStates[x] = digitalRead(switches[x]); }

void hoopInterrupt() { hoopState = digitalRead(hoopSensor); }

basketInterrupt(0);
basketInterrupt(1);
basketInterrupt(2);
basketInterrupt(3);
basketInterrupt(4);
basketInterrupt(5);
basketInterrupt(6);
basketInterrupt(7);
basketInterrupt(8);
basketInterrupt(9);
basketInterrupt(10);
basketInterrupt(11);
basketInterrupt(12);

buttonInterrupt(0);
buttonInterrupt(1);
buttonInterrupt(2);
buttonInterrupt(3);
buttonInterrupt(4);
buttonInterrupt(5);
buttonInterrupt(6);
buttonInterrupt(7);

switchInterrupt(0);

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

  reboundLight = 12;

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
    digitalWrite(baskets[i], LOW); //Baskets start off
    lastSensorStates[i] = HIGH;
    sensorStates[i] = HIGH;    
    triggeredBaskets[i] = 0;
  }

  for (i = 0; i < numIndicators; i++) {
    pinMode(indicators[i], OUTPUT); // init misc indicator pin as output
    digitalWrite(indicators[i], LOW); //indicators start off
  }

  for (i = 0; i < numButtons; i++) {
    pinMode(buttons[i], INPUT_PULLUP);
    lastButtonStates[i] = HIGH;
    buttonStates[i] = HIGH;
    triggeredButtons[i] = 0;
  }

  for (i = 0; i < numSwitches; i++) {
    pinMode(switches[i], INPUT_PULLUP);
    lastSwitchStates[i] = HIGH;
    switchStates[i] = HIGH;
    changedSwitches[i] = 0;
  }

  pinMode(reboundLight, OUTPUT);
  digitalWrite(reboundLight, LOW); //Rebound starts off

  pinMode(hoopLight, OUTPUT);
  pinMode(hoopSensor, INPUT);
  digitalWrite(hoopSensor, HIGH);
  digitalWrite(hoopLight, LOW); //Hoop starts off
  lastHoopState = HIGH;
  hoopState = HIGH;
  triggeredHoop = 0;

  Serial.begin(57600);

  attachInterrupt(basketSensors[0], basketInterrupt0, CHANGE);
  attachInterrupt(basketSensors[1], basketInterrupt1, CHANGE);
  attachInterrupt(basketSensors[2], basketInterrupt2, CHANGE);
  attachInterrupt(basketSensors[3], basketInterrupt3, CHANGE);
  attachInterrupt(basketSensors[4], basketInterrupt4, CHANGE);
  attachInterrupt(basketSensors[5], basketInterrupt5, CHANGE);
  attachInterrupt(basketSensors[6], basketInterrupt6, CHANGE);
  attachInterrupt(basketSensors[7], basketInterrupt7, CHANGE);
  attachInterrupt(basketSensors[8], basketInterrupt8, CHANGE);
  attachInterrupt(basketSensors[9], basketInterrupt9, CHANGE);
  attachInterrupt(basketSensors[10], basketInterrupt10, CHANGE);
  attachInterrupt(basketSensors[11], basketInterrupt11, CHANGE);
  attachInterrupt(basketSensors[12], basketInterrupt12, CHANGE);

  attachInterrupt(buttons[0], buttonInterrupt0, CHANGE);
  attachInterrupt(buttons[1], buttonInterrupt1, CHANGE);
  attachInterrupt(buttons[2], buttonInterrupt2, CHANGE);
  attachInterrupt(buttons[3], buttonInterrupt3, CHANGE);
  attachInterrupt(buttons[4], buttonInterrupt4, CHANGE);
  attachInterrupt(buttons[5], buttonInterrupt5, CHANGE);
  attachInterrupt(buttons[6], buttonInterrupt6, CHANGE);
  attachInterrupt(buttons[7], buttonInterrupt7, CHANGE);

  attachInterrupt(switches[0], switchInterrupt0, CHANGE);

  attachInterrupt(hoopSensor, hoopInterrupt, CHANGE);
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
    case 'H': //Turn on hoop
      digitalWrite(hoopLight, HIGH);
      break;
    case 'h': //Turn off hoop
      digitalWrite(hoopLight, LOW);
      break;
    case 'R': //Turn on rebound
      digitalWrite(reboundLight, HIGH);
      break;
    case 'r': //Turn off rebound
      digitalWrite(reboundLight, LOW);
      break;
    
  }
  inputPos = 0;
}

void loop() {
  int i;

  for (i = 0; i < numBaskets; i++) {
    triggeredBaskets[i] = 0;
  }
  for (i = 0; i < numButtons; i++) {
    triggeredButtons[i] = 0;
  }
  for (i = 0; i < numSwitches; i++) {
    changedSwitches[i] = 0;
  }
  triggeredHoop = 0;
  for (i = 0; i < numPiezoSensors; i++) {
    triggeredPiezoSensors[i] = 0;
  }

  noInterrupts();
  for (i = 0; i < numBaskets; i++) {
    if (lastSensorStates[i] == HIGH && sensorStates[i] == LOW) {
      triggeredBaskets[i] = 1;
    }
    lastSensorStates[i] = sensorStates[i];
  }
  
  for (i = 0; i < numButtons; i++) {
    if (lastButtonStates[i] == HIGH && buttonStates[i] == LOW) {
      triggeredButtons[i] = 1;
    }
    lastButtonStates[i] = buttonStates[i];
  }
  
  for (i = 0; i < numSwitches; i++) {
    if (lastSwitchStates[i] != switchStates[i]) {
      if (switchStates[i] == LOW) {
        changedSwitches[i] = 1;
      } else {
        changedSwitches[i] = 2;
      }
    }
    lastSwitchStates[i] = switchStates[i];
  }
  
  if (lastHoopState == HIGH && hoopState == LOW) {
    triggeredHoop = 1;
  }
  lastHoopState = hoopState;  
  interrupts();

  int sensorValue;
  int sensorState;

  for (i = 0; i < numPiezoSensors; i++) {
    sensorValue = analogRead(piezoSensors[i]);
    sensorState = (sensorValue > piezoThreshold) ? HIGH : LOW;

    if (lastPiezoStates[i] == LOW && sensorState == HIGH) {
      triggeredPiezoSensors[i] = 1;
    }

    lastPiezoStates[i] = sensorState;    
  }

  for (i = 0; i < numBaskets; i++) {
    if (triggeredBaskets[i] == 1) {
      serialmsg('B', i);
    }
  }

  for (i = 0; i < numButtons; i++) {
    if (triggeredButtons[i] == 1) {
      serialmsg('P', i);
    }
  }

  for (i = 0; i < numSwitches; i++) {
    if (changedSwitches[i] == 1) {
      serialmsg('S', i);
    }
    if (changedSwitches[i] == 2) {
      serialmsg('s', i);
    }
  }

  if (triggeredHoop == 1) {
    serialmsg('g', 0);
  }

  for (i = 0; i < numPiezoSensors; i++) {
    if (triggeredPiezoSensors[i] == 1) {
      serialmsg('z', i);
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


