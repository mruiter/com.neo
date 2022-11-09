'use strict';

const Homey = require('homey');
const { ZwaveDevice } = require('homey-zwavedriver');

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register device capabilities
    this.registerCapability('alarm_contact', 'NOTIFICATION');
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = DoorWindowSensor_DS01Z;
