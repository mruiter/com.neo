'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class Repeater_RE01Z extends LoggingZwaveDevice {
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
