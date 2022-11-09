'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class MultiSensor_PD01Z extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('alarm_motion', 'NOTIFICATION');
    this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
	this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = MultiSensor_PD01Z;
