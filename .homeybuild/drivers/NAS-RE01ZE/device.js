'use strict';

const Homey = require('homey');
const { ZwaveDevice } = require('homey-zwavedriver');

class Repeater_RE01Z extends ZwaveDevice {
  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register device capabilities
	this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
	this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');
  }
}
module.exports = Repeater_RE01Z;
