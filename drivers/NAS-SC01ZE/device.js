'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class WallSwitchDual_SC01Z extends ZwaveDevice {
	async onMeshInit() {
		//this.enableDebug();
		//this.printNode();
		this.registerCapability('onoff', 'SWITCH_BINARY');
		
		//===== Led On/Off
		let SC01ZE_LED_mode_run_listener = async(args) => {
			this.log('FlowCardAction Set Led Mode to: ', args.led_mode);
			this.configurationSet({id: 'backlight'}, args.led_mode);
		};
		let actionSC01ZE_led_mode = new Homey.FlowCardAction('SC01ZE_led_mode');
		actionSC01ZE_led_mode
			.register()
			.registerRunListener(SC01ZE_LED_mode_run_listener);		
	}
}
module.exports = WallSwitchDual_SC01Z;
