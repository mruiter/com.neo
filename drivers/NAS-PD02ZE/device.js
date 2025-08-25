'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class MultiSensor_PD02Z extends LoggingZwaveDevice {
  async onNodeInit() {
    this.registerCapability('measure_battery', 'BATTERY');
    this.registerCapability('alarm_motion', 'NOTIFICATION');
    this.registerCapability('alarm_tamper', 'NOTIFICATION');
    this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
    this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
    this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');
  }
}

module.exports = MultiSensor_PD02Z;
