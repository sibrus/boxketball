/*
  Blink
  Turns on an LED on for one second, then off for one second, repeatedly.

  Most Arduinos have an on-board LED you can control. On the Uno and
  Leonardo, it is attached to digital pin 13. If you're unsure what
  pin the on-board LED is connected to on your Arduino model, check
  the documentation at http://www.arduino.cc

  This example code is in the public domain.

  modified 8 May 2014
  by Scott Fitzgerald
 */

int numBaskets = 1;
int baskets[1];
int basketSensors[1];


void setup() {
  baskets[0] = 5;
  basketSensors[0] = 6;

  int i;
  for (i = 0; i < numBaskets; i++) {
    pinMode(baskets[i], OUTPUT); // init basket indicator pin as output
    pinMode(basketSensors[i], INPUT); // init sensor pin as input
    digitalWrite(basketSensors[i], HIGH); // turn on the pullup
  }
}

// the loop function runs over and over again forever
void loop() {
  int i;
  for (i = 0; i < numBaskets; i++) {
    if (digitalRead(basketSensors[i]) == LOW) { //Sensor triggered
      digitalWrite(baskets[i], HIGH); //Turn on basket
    } else {
      digitalWrite(baskets[i], LOW); //Turn off basket
    }
  }
}
