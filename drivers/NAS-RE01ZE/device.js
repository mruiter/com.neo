'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class Repeater_RE01Z extends ZwaveDevice {

  onNodeInit() {
    this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
    this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');
  }
}

module.exports = Repeater_RE01Z;
