'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class WaterSensor_WS01 extends LoggingZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register capabilities for this device
    this.registerCapability('alarm_water', 'SENSOR_BINARY');
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = WaterSensor_WS01;
