'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-zwavedriver').ZwaveDevice;

class WaterSensor_WS01 extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('alarm_water', 'SENSOR_BINARY', {
			getOpts: {
				getOnOnline: true,
			},
		});
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = WaterSensor_WS01;
