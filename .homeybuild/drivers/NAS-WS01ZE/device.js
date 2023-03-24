'use strict';

const Homey = require('homey');
const { ZwaveDevice } = require('homey-zwavedriver');

class WaterSensor_WS01 extends ZwaveDevice {

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
