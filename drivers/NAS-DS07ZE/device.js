'use strict';

const Homey = require('homey');
const { ZwaveDevice } = require('homey-zwavedriver');

class DoorWindowSensor_DS07Z extends ZwaveDevice {
  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register device capabilities
    this.registerCapability('alarm_contact', 'NOTIFICATION');
	this.registerCapability('alarm_tamper', 'NOTIFICATION');
	this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
	this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = DoorWindowSensor_DS07Z;
