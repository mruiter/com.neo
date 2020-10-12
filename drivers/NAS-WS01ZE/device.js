'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class WaterSensor_WS01 extends ZwaveDevice {

  async onNodeInit() {
    this.registerCapability('alarm_water', 'SENSOR_BINARY', {
			getOpts: {
				getOnOnline: true,
			},
		});
    this.registerCapability('measure_battery', 'BATTERY');
  }

}

module.exports = WaterSensor_WS01;
