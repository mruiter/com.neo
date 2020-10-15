'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class MultiSensor_PD02Z extends ZwaveDevice {
  async onMeshInit() {
    //*this.enableDebug();
    //*this.printNode();
    this.registerCapability('alarm_motion', 'NOTIFICATION', {
			getOpts: {
				getOnOnline: true,
			},
		});
    this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {
			getOpts: {
				getOnOnline: true,
			},
		});
	this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL', {
			getOpts: {
				getOnOnline: true,
			},
		});
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = MultiSensor_PD02Z;
