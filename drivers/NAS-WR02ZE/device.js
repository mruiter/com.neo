'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class Wallplug_WR02Z extends ZwaveDevice {
  onMeshInit() {
    // this.enableDebug();
    // this.printNode();
    this.registerCapability('onoff', 'SWITCH_BINARY');
	this.registerCapability('meter_power', 'METER');
    this.registerCapability('measure_power', 'METER');
	this.registerCapability('measure_current', 'METER');
    this.registerCapability('measure_voltage', 'METER');

	// define FlowCardAction to reset meter_power
		let WR02Z_reset_meter_run_listener = async(args) => {
			let result = await args.device.node.CommandClass.COMMAND_CLASS_METER.METER_RESET({})
			if (result !== 'TRANSMIT_COMPLETE_OK') throw new Error(result);
		};

		let actionWR02Z_reset_meter = new Homey.FlowCardAction('WR02Z_reset_meter');
		actionWR02Z_reset_meter
			.register()
			.registerRunListener(WR02Z_reset_meter_run_listener);	
  }
}
module.exports = Wallplug_WR02Z;
