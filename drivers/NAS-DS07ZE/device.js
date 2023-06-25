'use strict';

const ZwaveDevice = require('homey-zwavedriver').ZwaveDevice;

class DoorWindowSensor_DS07Z extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('alarm_contact', 'NOTIFICATION', {
			getOpts: {
				getOnOnline: true,
			},
		});
	this.registerCapability('alarm_tamper', 'NOTIFICATION', {
			getOpts: {
				getOnOnline: true,
			},
		});
	this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {
			getOpts: {
				getOnOnline: true,
			},
		});
	this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL', {
			getOpts: {
				getOnOnline: true,
			},
		});
		
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = DoorWindowSensor_DS07Z;
