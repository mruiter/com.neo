'use strict';

const Homey = require('homey');
const { ZwaveDevice } = require('homey-zwavedriver');

class MultiSensor_PD07Z extends ZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register device capabilities
    this.registerCapability('alarm_motion', 'NOTIFICATION');
        this.registerCapability('alarm_tamper', 'NOTIFICATION');
    this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {
      getOpts: {
        getOnStart: false,
      },
    });
        this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL', {
      getOpts: {
        getOnStart: false,
      },
    });
        this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL', {
      getOpts: {
        getOnStart: false,
      },
    });
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = MultiSensor_PD07Z;
